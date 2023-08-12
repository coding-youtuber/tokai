import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function clearDirectory(directory: string): void {
    fs.readdirSync(directory).forEach(file => {
        const filePath = path.join(directory, file);
        fs.unlinkSync(filePath);
    });
}

function renameImagesToSequentialNumbers(limit: number = 10): void {
    const imageDir = path.join(__dirname, 'images');
    const renamedImagesDir = path.join(__dirname, 'renamed_images');

    // ディレクトリが存在しない場合、renamed_imagesディレクトリを作成
    if (!fs.existsSync(renamedImagesDir)) {
        fs.mkdirSync(renamedImagesDir);
    } else {
        clearDirectory(renamedImagesDir); // ディレクトリの中身をクリア
    }

    const images = fs.readdirSync(imageDir)
        .filter((filename: string) => filename.endsWith('.png'))
        .sort()  // 必要に応じて適切なソート方法を追加
        .slice(0, limit);  // 画像数を制限

    images.forEach((filename: string, index: number) => {
        const oldPath = path.join(imageDir, filename);
        const newPath = path.join(renamedImagesDir, `${index.toString().padStart(4, '0')}.png`);
        fs.copyFileSync(oldPath, newPath);  // 画像を新しいディレクトリにコピー
    });
}

function createVideoFromImages(): void {
    // 画像のパスと動画の出力先パス
    const renamedImagesPath = path.join(__dirname, 'renamed_images', '%04d.png');
    const outputPath = path.join(__dirname, 'output.mp4');

    // ffmpegを利用して動画を作成
    const ffmpegCommand = `ffmpeg -framerate 1/2 -i "${renamedImagesPath}" -c:v libx264 -r 30 -pix_fmt yuv420p "${outputPath}"`;
    execSync(ffmpegCommand, { stdio: 'inherit' });
}

renameImagesToSequentialNumbers(10);  // 10枚の画像に制限
createVideoFromImages();
