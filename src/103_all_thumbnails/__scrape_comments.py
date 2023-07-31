import os
import subprocess
import concurrent.futures

def download_comments(video_id):
    # コマンドを組み立てる
    command = f"rye run youtube-comment-downloader --youtubeid {video_id.strip()} -p --sort 0 --language ja --output comments/{video_id.strip()}.json"
    print(command)

    # コマンドを実行する
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()

    if process.returncode != 0:
        print(f"Error with video_id {video_id}: {stderr}")

    return process.returncode

def main():
    # "comments" ディレクトリが存在しない場合は作成する
    if not os.path.exists('comments'):
        os.makedirs('comments')

    with open('output.txt', 'r') as f:
        video_ids = f.readlines()

    # ProcessPoolExecutorを作成し、CPUコア数に応じたプロセス数でタスクを並列実行する
    with concurrent.futures.ProcessPoolExecutor(max_workers=8) as executor:
        # map関数は、各ビデオIDについてdownload_comments関数を非同期に呼び出します
        results = executor.map(download_comments, video_ids)

    for video_id, result in zip(video_ids, results):
        if result == 0:
            print(f"Successfully downloaded comments for video {video_id.strip()}")
        else:
            print(f"Failed to download comments for video {video_id.strip()}")

# main関数をスクリプトのエントリポイントとして定義
if __name__ == "__main__":
    main()
