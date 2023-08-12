import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function fetchCommentsWithChannel() {
    try {
        // 指定された条件でコメントと関連するチャンネル情報をフェッチ
        const commentsWithChannel = await prisma.comment.findMany({
            where: {
                text: {
                    contains: '珍棒',
                },
            },
            orderBy: {
                votes: 'desc',
            },
            include: {
              Video: true,  // 動画情報を含める
                AuthorChannel: true  // チャンネル情報を含める
            }
        });

        // 結果をJSONファイルに保存
        const outputPath = path.join(__dirname, 'results.json');
        fs.writeFileSync(outputPath, JSON.stringify(commentsWithChannel, null, 2));
        console.log('Results with channel information saved to results.json');

    } catch (error) {
        console.error('Error fetching comments:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// 関数の実行
fetchCommentsWithChannel();
