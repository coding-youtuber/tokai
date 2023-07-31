import os
import subprocess
from PIL import Image

# 指定したディレクトリ内のファイルをすべて削除する関数
def clear_directory(directory):
    for file in os.listdir(directory):
        os.remove(os.path.join(directory, file))

# 画像をリサイズし、連番でリネームして保存する関数
def rename_and_resize_images(source_directory, target_directory, num_images=60):
    # ターゲットディレクトリが存在しなければ作成
    if not os.path.exists(target_directory):
        os.makedirs(target_directory)

    # ターゲットディレクトリ内のファイルを全て削除
    clear_directory(target_directory)

    # ソースディレクトリのファイル名をソートして取得し、最初のnum_imagesだけ処理
    files = sorted(os.listdir(source_directory))[:num_images]
    total_files = len(files)
    for i, file in enumerate(files):
        ext = os.path.splitext(file)[1]
        image = Image.open(os.path.join(source_directory, file))
        # 画像を1920x1080の半分のサイズにリサイズ
        resized_image = image.resize((960, 540))
        # リサイズした画像を連番で保存
        resized_image.save(os.path.join(target_directory, f'{i:04d}{ext}'))
        print(f"{total_files}枚中 {i+1}枚目の画像処理完了")

# 4枚の画像を1枚の画像に結合して保存する関数
def concatenate_images(source_directory, target_directory):
    # ターゲットディレクトリが存在しなければ作成
    if not os.path.exists(target_directory):
        os.makedirs(target_directory)

    # ターゲットディレクトリ内のファイルを全て削除
    clear_directory(target_directory)

    # ソースディレクトリのファイル名をソートして取得
    files = sorted(os.listdir(source_directory))
    total_files = len(files) // 4  # 出力する画像の枚数を計算

    # 4枚ずつ画像を読み込み、1枚の画像に結合して保存
    for i in range(total_files):
        images = [Image.open(os.path.join(source_directory, files[j])) for j in range(i*4, (i+1)*4)]
        concated_image = Image.new('RGB', (1920, 1080))
        for j in range(4):
            concated_image.paste(images[j], (j % 2 * 960, j // 2 * 540))
        concated_image.save(os.path.join(target_directory, f'{i:04d}.jpg'))
        print(f"{total_files}枚中 {i+1}枚目の画像結合完了")

    # 余りの画像があれば、それぞれを1枚の画像として中央に配置して保存
    remaining_images = len(files) % 4
    if remaining_images > 0:
        for i in range(remaining_images):
            image = Image.open(os.path.join(source_directory, files[total_files*4+i]))
            concated_image = Image.new('RGB', (1920, 1080))
            concated_image.paste(image, (480, 270))  # 画像を中央に配置
            concated_image.save(os.path.join(target_directory, f'{total_files+i:04d}.jpg'))
            print(f"{total_files + remaining_images}枚中 {total_files+i+1}枚目の画像結合完了")

# 画像を元に動画を作成する関数
def create_video(directory, output, fps=30, frame_interval=5):
    command = f'ffmpeg -y -r {fps//frame_interval} -i {directory}/%04d.jpg -vcodec libx264 -crf 25 -pix_fmt yuv420p {output}'
    subprocess.call(command, shell=True)

def main():
    # 入力画像のディレクトリ、出力ディレクトリの指定
    source_directory = 'images'
    renamed_directory = 'renamed_images'
    concated_directory = 'concated_images'
    output = 'output.mp4'

    # 画像のリサイズ、リネーム
    rename_and_resize_images(source_directory, renamed_directory)
    # 画像の結合
    concatenate_images(renamed_directory, concated_directory)
    # 動画の作成
    create_video(concated_directory, output)

if __name__ == "__main__":
    main()
