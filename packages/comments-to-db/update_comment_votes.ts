import { Prisma, PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function processCommentsJSON(filePath: string, videoId: string) {
  let updateCount = 0; // このファイルでの更新回数をカウント

  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    for (const comment of jsonData.comments) {
      if (comment.votes.includes('万')) {
        const votesInt = parseFloat(comment.votes.replace('万', '')) * 10000;

        await prisma.comment.update({
          where: { cid: comment.cid },
          data: { votes: votesInt },
        });

        updateCount++; // 更新が成功したらカウントを増やす
      }
    }
  } catch (error) {
    console.error(`Error processing file: ${filePath}`);
    fs.writeFileSync('error_update_votes_video_ids.txt', videoId + '\n', { flag: 'a' });
  }

  return updateCount; // このファイルでの更新回数を返す
}

async function main() {
  const dirPath = path.join(__dirname, '../datasource/comments');
  const files = await fs.promises.readdir(dirPath);
  let totalUpdateCount = 0; // 全体での更新回数をカウント

  for (let i = 0; i < files.length; i += 5) {
    const chunk = files.slice(i, i + 5);

    for (const file of chunk) {
      if (path.extname(file) === '.json') {
        const videoId = path.basename(file, path.extname(file));
        const filePath = path.join(dirPath, file);
        const updateCount = await processCommentsJSON(filePath, videoId); // 更新回数を取得
        totalUpdateCount += updateCount; // 全体のカウントに追加
      }
    }

    console.log(`Processed ${Math.min(i + 5, files.length)} / ${files.length} files. Total updates so far: ${totalUpdateCount}`);
  }

  console.log(`Processing complete. Total updates: ${totalUpdateCount}`); // 最終的な更新回数をログに出力
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
