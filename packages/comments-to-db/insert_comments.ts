import { Prisma, PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type Comment = {
  cid: string;
  text: string;
  author: string;
  channel: string;
  votes: string;
  photo: string;
  video_id: string;
  heart: boolean;
  reply: boolean;
  time_parsed?: number;
};

type CommentWithDate = Comment & {
  votes_int: number;
  time_parsed_date?: Date;
};

type CommentJSON = {
  comments: Comment[];
};

async function processCommentsJSON(filePath: string, videoId: string) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data) as CommentJSON;

    for (const comment of jsonData.comments) {
      const commentData = {
        ...comment,
        time_parsed_date: comment.time_parsed ? new Date(comment.time_parsed * 1000) : undefined,
        votes_int: parseInt(comment.votes),
        video_id: videoId,
      };
      const exists = await prisma.comment.findUnique({ where: { cid: comment.cid } });
      if (!exists) {
        await prisma.comment.create({
          data: {
            cid: commentData.cid,
            text: commentData.text,
            author_handle: commentData.author,
            votes: commentData.votes_int,
            heart: commentData.heart,
            reply: commentData.reply,
            time_parsed: commentData.time_parsed_date,
            Video: {
              connect: {
                video_id: commentData.video_id,
              },
            },
            AuthorChannel: {
              connectOrCreate: {
                where: {
                  channel_id: commentData.channel,
                },
                create: {
                  channel_id: commentData.channel,
                  handle: commentData.author,
                  photo: commentData.photo,
                },
              },
            },
          },
        });
      }
    }
  } catch (error) {
    console.log(error)
    console.error(`Error processing file: ${filePath}`);
    fs.writeFileSync('error_video_ids.txt', videoId + '\n', { flag: 'a' }); // エラーが発生したvideoIdをファイルに追記します。
  }
}

async function main() {
  const dirPath = path.join(__dirname, '../thumbnail-comment-downloader/comments')
  const files = await fs.promises.readdir(dirPath);

  for (let i = 0; i < files.length; i += 5) {
    const chunk = files.slice(i, i + 5);

    for (const file of chunk) {
      if (path.extname(file) === '.json') {
        const videoId = path.basename(file, path.extname(file));
        const filePath = path.join(dirPath, file);
        await processCommentsJSON(filePath, videoId);
      }
    }

    console.log(`Processed ${Math.min(i + 5, files.length)} / ${files.length} files`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
