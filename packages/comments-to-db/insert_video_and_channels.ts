import { Prisma, PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type Video = {
  video_id: string;
  title: string;
  views: number;
  publish_date: string;
  author: string;
  channel_id: string;
};

async function getVideoJSON() {
  const dirPath = path.join(__dirname, '../video-info-downloader/data');
  const files = await fs.promises.readdir(dirPath);
  let res = [];

  for (const file of files) {
    if (path.extname(file) === '.json') {
      const filePath = path.join(dirPath, file);
      const data = await fs.promises.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data) as Video;

      // Perform your processing here
      // console.log(jsonData);
      res.push({
        ...jsonData,
        publish_date_datetime: new Date(jsonData.publish_date),
      });
    }
  }

  return res;
}

async function main() {
  const videos = await getVideoJSON();
  console.log(`Found ${videos.length} videos`);

  let videoQueries: Prisma.VideoCreateInput[] = videos.map(video => {
    return {
      video_id: video.video_id,
      title: video.title,
      views: video.views,
      publish_date: video.publish_date_datetime,
      // Channelを指定するのでchannel_idは不要
      Channel: {
        connectOrCreate: {
          where: {
            channel_id: video.channel_id,
          },
          create: {
            channel_id: video.channel_id,
            channel_label: video.author,
          },
        },
      },
    };
  });

  for (const [index, query] of videoQueries.entries()) {
    try {
      await prisma.video.create({
        data: query,
      });
      if ((index + 1) % 500 === 0) {
        console.log(`Progress: ${index + 1}/${videoQueries.length}`);
      }
    } catch (e) {
      console.error(`Error on index ${index}:`, e);
      console.log(`Failed query:`, query);
    }
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
