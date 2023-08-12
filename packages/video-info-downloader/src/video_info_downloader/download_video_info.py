from pytube import YouTube
import json
import os
import re

def get_video_ids_from_file(file_path):
    """
    Read video ids from a text file, each id on a new line

    Parameters:
    file_path (str): The path to the text file

    Returns:
    list: A list of video ids read from the file
    """
    
    with open(file_path, 'r') as file:
        video_ids = [line.strip() for line in file.readlines()]
        
    return video_ids

def to_model(video):
    return {
        "video_id": video.video_id,
        "title": video.title,
        "views": video.views,
        "publish_date": str(video.publish_date),
        "author": video.author,
        "channel_id": video.channel_id,
    }

def main():
    file_path = "../datasource/tokai_all_video_ids.txt"
    video_ids = get_video_ids_from_file(file_path)

    error_video_ids = []
    total_videos = len(video_ids)

    for i, video_id in enumerate(video_ids):
        try:
            output_file = f"data/{video_id}.json"
            if os.path.exists(output_file):
                print(f"Skipping {video_id} because the file already exists.")
                continue

            yt = YouTube(f"https://www.youtube.com/watch?v={video_id}")
            model = to_model(yt)

            with open(output_file, 'w') as file:
                json.dump(model, file)

            print(f"Saved data for {video_id} to {output_file}")
        except Exception as e:
            print(f"Error processing {video_id}: {e}")
            error_video_ids.append(video_id)

        # Calculate and print the progress
        progress = (i + 1) / total_videos * 100
        print(f"Progress: {progress:.2f}%")

    # Save any error video ids to a file
    if error_video_ids:
        with open('error_video_ids.txt', 'w') as file:
            for video_id in error_video_ids:
                file.write(f"{video_id}\n")

if __name__ == "__main__":
    main()
