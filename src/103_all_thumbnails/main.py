import requests
import os

def download_thumbnail(video_id, directory):
    base_url = 'http://img.youtube.com/vi/{}/maxresdefault.jpg'
    url = base_url.format(video_id)

    response = requests.get(url, stream=True)

    if response.status_code == 200:
        with open(os.path.join(directory, video_id + '.jpg'), 'wb') as out_file:
            out_file.write(response.content)
        print("Successfully downloaded thumbnail for video ID: ", video_id)
    else:
        print("Error, unable to download image for ", video_id)


def read_video_ids(file_path):
    with open(file_path, 'r') as file:
        video_ids = file.read().splitlines()
    return video_ids


def main():
    directory = 'images'
    if not os.path.exists(directory):
        os.makedirs(directory)

    video_ids = read_video_ids('output.txt')
    total_videos = len(video_ids)
    print("Total videos to download thumbnails: ", total_videos)
    
    for i, video_id in enumerate(video_ids):
        print(f"Downloading thumbnail for video {i+1} out of {total_videos}")
        download_thumbnail(video_id, directory)


if __name__ == "__main__":
    main()
