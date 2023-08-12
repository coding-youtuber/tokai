import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function generateCommentHTML(commentData: any): Promise<string> {
  const date = new Date(commentData.time_parsed);
  const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  // テキスト内の「珍棒」をハイライトする
  const highlightedText = commentData.text.replace(/珍棒/g, '<span style="background-color: yellow;">珍棒</span>');

  const thumbnailURL = `http://img.youtube.com/vi/${commentData.Video.video_id}/mqdefault.jpg`;

  return `
      <div style="width: 800px; font-family: Arial, sans-serif; padding: 20px; box-sizing: border-box; display: flex; align-items: start; border: 1px solid #ccc; background-color: #ffffff;">
          <img src="${commentData.AuthorChannel.photo}" style="width: 80px; height: 80px; border-radius: 50%; margin-right: 20px;">
          <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>${commentData.author_handle}</span>
                  <span style="color: gray;">${formattedDate}</span>
              </div>
              <div style="font-size: 18px; margin-top: 10px;">${highlightedText}</div>
              <div style="margin-top: 10px;">${commentData.votes}いいね</div>
              <div style="margin-top: 10px; display: flex; align-items: center;">
                  <img src="${thumbnailURL}" style="width: 80px; height: 45px; margin-right: 10px;">
                  <span>${commentData.Video.title}</span>
              </div>
          </div>
      </div>
  `;
}




async function generateImage(commentData: any) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlContent = await generateCommentHTML(commentData);

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
    for (let comment of resultsData.slice(0, 10)) {
        await generateImage(comment);
    }
})();
