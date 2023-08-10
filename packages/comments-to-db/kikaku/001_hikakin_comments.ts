import { Prisma, PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Prismaを使用してクエリを実行
  const comments = await prisma.comment.findMany({
    where: {
      author_channel_id: "UCZf__ehlCEBPop-_sldpBUQ"
    },
    orderBy: {
      time_parsed: 'asc'
    }
  });

  // 結果を指定されたJSONファイルに保存
  fs.writeFileSync(
    path.join(__dirname, 'json/001_hikakin_comments.json'),
    JSON.stringify(comments, null, 2)
  );
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
