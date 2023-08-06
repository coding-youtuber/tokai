import os
import concurrent.futures
from library import download_comments as dc

# 定数化された設定
VIDEO_ID_FILE_PATH = "../comments-to-db/error_unique_video_ids.txt"  # ビデオIDのリストを含むファイルのパス
# VIDEO_ID_FILE_PATH = "output.txt"  # ビデオIDのリストを含むファイルのパス
RE_DOWNLOAD = True  # 再ダウンロードを行う場合はTrueに設定
SUCCESSFUL_VIDEO_IDS_FILE = "logs/success/video_ids.txt"  # 成功したビデオIDを保存するファイルのパス

# YouTube動画のコメントをダウンロードする関数
def download_comments(video_id):
    # 成功したビデオIDを読み込む
    with open(SUCCESSFUL_VIDEO_IDS_FILE, 'r') as f:
        successful_video_ids = f.read().splitlines()
        
    # 既に成功したビデオIDに対するダウンロードはスキップする
    if video_id in successful_video_ids:
        return video_id, -2
    
    # ダウンロードしたコメントを保存するJSONファイルのパスを設定します
    output_json_path = f"comments/{video_id}.json"
    
    # すでにダウンロード済みのコメントは再ダウンロードせずにスキップします
    if not RE_DOWNLOAD and os.path.exists(output_json_path):
        return video_id, -1  # スキップしたことを示すための特殊な戻り値

    # download_comments関数（外部ライブラリに含まれている）を呼び出してコメントをダウンロードします
    result = dc(youtube_id=video_id, output=output_json_path, pretty=True)
    
    if result == 0:
        # 成功したビデオIDをファイルに書き込む
        with open(SUCCESSFUL_VIDEO_IDS_FILE, 'a') as f:
            f.write(video_id + '\n')
            
    return video_id, result


# 順番にコメントをダウンロードする関数
def download_in_sequence(video_ids):
    total_videos = len(video_ids)
    completed_videos = 0
    
    # video_idsのリストの各要素に対してコメントをダウンロードします
    for video_id in video_ids:
        video_id, result = download_comments(video_id)
        completed_videos += 1
        
        # ダウンロードの進捗を表示します
        print_progress(video_id, result, completed_videos, total_videos)

# 並行してコメントをダウンロードする関数
def download_in_parallel(video_ids):
    total_videos = len(video_ids)
    completed_videos = 0
    
    # concurrent.futuresを使用して並行処理を実装します
    with concurrent.futures.ProcessPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(download_comments, video_id) for video_id in video_ids}
        
        # as_completedメソッドで結果を取得します（完了したタスクから順に）
        for future in concurrent.futures.as_completed(futures):
            video_id, result = future.result()
            completed_videos += 1
            
            # ダウンロードの進捗を表示します
            print_progress(video_id, result, completed_videos, total_videos)

# ダウンロードの進捗を表示する関数
def print_progress(video_id, result, completed_videos, total_videos):
    # 結果に応じてメッセージを表示します
    if result == 0:
        print(f"Successfully downloaded comments for video {video_id}")
    elif result == -1:
        print(f"Skipped video {video_id} (already downloaded)")
    elif result == -2:
        print(f"Skipped video {video_id} (already successfully downloaded)")
    else:
        print(f"Failed to download comments for video {video_id}")
    
    # 全体の進捗をパーセンテージで表示します
    print(f"Progress: {completed_videos}/{total_videos} ({100.0 * completed_videos / total_videos:.2f}%)")

def main():
    # "comments"ディレクトリが存在しない場合は作成します
    if not os.path.exists('comments'):
        os.makedirs('comments')

    # ビデオIDのリストをテキストファイルから読み込みます
    with open(VIDEO_ID_FILE_PATH, 'r') as f:
        video_ids = [id_.strip() for id_ in f.readlines()]

    # 並列実行するかどうかを制御するフラグ
    use_parallel = True  # このフラグをTrueに設定すると並列実行します
    if use_parallel:
        download_in_parallel(video_ids)
    else:
        download_in_sequence(video_ids)

if __name__ == "__main__":
    main()
