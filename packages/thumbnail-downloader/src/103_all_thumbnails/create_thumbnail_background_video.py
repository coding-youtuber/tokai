import os
import random
import subprocess

def get_random_images(img_dir, num=130):
    """ディレクトリ内の画像をランダムに選択する関数"""
    all_images = [f for f in os.listdir(img_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    selected_images = random.sample(all_images, num)
    return selected_images

def create_temp_video_from_image(img_path, idx, temp_videos_dir):
    """画像から一時的な動画ファイルを作成する関数"""
    temp_video_name = os.path.join(temp_videos_dir, f'temp_video_{idx}.mp4')
    
    cmd = [
        'ffmpeg', '-loop', '1', '-i', img_path, '-c:v', 'libx264',
        '-t', '6', '-pix_fmt', 'yuv420p', '-vf', 'scale=1920:-1', temp_video_name
    ]
    subprocess.run(cmd)
    
    return temp_video_name

def concatenate_videos(video_list, output_name):
    """動画ファイルを連結する関数"""
    with open('temp_list.txt', 'w') as f:
        for video in video_list:
            f.write(f"file '{video}'\n")
    
    cmd = [
        'ffmpeg', '-f', 'concat', '-safe', '0', '-i', 'temp_list.txt',
        '-c', 'copy', output_name
    ]
    subprocess.run(cmd)
    
    os.remove('temp_list.txt')

def main():
    img_dir = 'images'
    output_video = 'output_thumbnail_video.mp4'
    temp_videos_dir = 'temp_videos'
    
    if not os.path.exists(temp_videos_dir):
        os.makedirs(temp_videos_dir)

    selected_images = get_random_images(img_dir)
    
    temp_videos = [create_temp_video_from_image(os.path.join(img_dir, img), idx, temp_videos_dir) for idx, img in enumerate(selected_images)]
    
    concatenate_videos(temp_videos, output_video)
    
    for tv in temp_videos:
        os.remove(tv)

    print(f'動画が {output_video} として保存されました。')

if __name__ == "__main__":
    main()
