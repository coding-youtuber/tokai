import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function generateCommentHTML(commentData: any, index: number): Promise<string> {
  const commentDate = commentData.time_parsed 
      ? new Date(commentData.time_parsed)
      : null;
  const videoPublishDate = new Date(commentData.Video.publish_date);

  const formattedCommentDate = commentDate 
      ? `${commentDate.getFullYear()}年${commentDate.getMonth() + 1}月${commentDate.getDate()}日 ${commentDate.getHours()}:${commentDate.getMinutes()}:${commentDate.getSeconds()}`
      : '';
  const formattedVideoPublishDate = `${videoPublishDate.getFullYear()}年${videoPublishDate.getMonth() + 1}月${videoPublishDate.getDate()}日`;

  const fontSize = commentData.text.length <= 60 ? '56px' : '24px';
  const highlightedText = commentData.text.replace(/珍棒/g, `<span style="background-color: yellow; font-size: ${fontSize}; font-weight: bold;">珍棒</span>`);
  const thumbnailURL = `http://img.youtube.com/vi/${commentData.Video.video_id}/mqdefault.jpg`;

  return `
      <div style="width: 1920px; height: 1080px; font-family: Arial, sans-serif; background-color: #efefef; display: flex; justify-content: center; align-items: center; flex-direction: column;">
          <div style="width: 80%; margin-bottom: 20px; font-size: 24px;">No.${index.toString().padStart(4, '0')}</div>
          <div style="width: 80%; background-color: #ffffff; padding: 30px; box-sizing: border-box; display: flex; align-items: start; border: 1px solid #ccc;">
              <img src="${commentData.AuthorChannel.photo}" alt="Profile Photo" style="width: 120px; height: 120px; border-radius: 50%; margin-right: 20px;">
              <div>
                  <div style="font-size: 24px;">${commentData.AuthorChannel.handle}</div>
                  <div style="font-size: ${fontSize};">${highlightedText}</div>
                  <div style="color: gray; margin-top: 10px;">
                      ${formattedCommentDate}
                  </div>
                  <div style="font-size: 32px; margin-top: 10px;">${commentData.votes}いいね</div>
              </div>
          </div>
          <div style="width: 80%; background-color: #ffffff; padding: 30px; box-sizing: border-box; display: flex; align-items: center; border: 1px solid #ccc; margin-top: 20px;">
              <img src="${thumbnailURL}" alt="Video Thumbnail" style="width: 240px; height: 135px; margin-right: 20px;">
              <div>
                  <div style="font-size: 32px;">${commentData.Video.title}</div>
                  <div style="color: gray; margin-top: 5px;">${formattedVideoPublishDate}</div>
              </div>
          </div>
      </div>
  `;
}


async function generateImage(commentData: any, index: number): Promise<void> {
    const browser = await puppeteer.launch({
      headless: "new"
    });
  
    const page = await browser.newPage();
    const htmlContent = await generateCommentHTML(commentData, index);

    await page.setContent(htmlContent);
    const element = await page.$('div');
    const screenshotOptions = {
        path: path.join(__dirname, `images/${commentData.cid}.png`),
        omitBackground: true
    };

    if (element) await element.screenshot(screenshotOptions);

    await browser.close();
}

(async () => {
    const resultsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'results.json'), 'utf-8'));
    const comments = resultsData.slice(0, 10);
    // const comments = resultsData.slice(0, 10);
    for (let i = 0; i < comments.length; i++) {
        await generateImage(comments[i], i);
        console.log(`Generated image for comment ${i}`)
    }
})();
