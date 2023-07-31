#!/bin/bash

# 日時をログファイル名に含める
current_date_time="$(date +'%Y%m%d_%H%M%S')"

# プログラムをバックグラウンドで実行し、出力をログファイルにリダイレクトする
# caffeinateを使って、このプロセスが完了するまでシステムをアクティブ状態に保つ
nohup caffeinate -i python src/103_all_thumbnails/scrape_comments.py > logs/log_${current_date_time}.txt 2>&1 &
