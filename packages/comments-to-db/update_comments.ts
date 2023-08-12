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

type CommentJSON = {
  comments: Comment[];
};

// 万を数値に変換する関数
function convertVotes(votes: string): number {
  if (votes.includes('万')) {
    return parseFloat(votes.replace('万', '')) * 10000;
  }
  return parseInt(votes);
}

async function processCommentsJSON(filePath: string, videoId: string) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data) as CommentJSON;

    for (const comment of jsonData.comments) {
      const commentData = {
        ...comment,
        time_parsed_date: comment.time_parsed ? new Date(comment.time_parsed * 1000) : undefined,
        votes_int: convertVotes(comment.votes),
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
    } else if (exists.votes !== commentData.votes_int) {
      // votesの値が異なる場合、そのコメントを更新
      await prisma.comment.update({
        where: { cid: comment.cid },
        data: {
          votes: commentData.votes_int,
        },
      });
    }
    }
  } catch (error) {
    console.log(error)
    console.error(`Error processing file: ${filePath}`);
    fs.writeFileSync('error_update_comments.txt', videoId + '\n', { flag: 'a' }); // エラーが発生したvideoIdをファイルに追記します。
  }
}

async function main() {
  const dirPath = path.join(__dirname, '../comment-downloader/comments')
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
