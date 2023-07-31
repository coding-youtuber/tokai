from youtube_comment_downloader import *
import io
import json
import os
import sys
import time

INDENT = 4


def to_json(comment, indent=None):
    comment_str = json.dumps(comment, ensure_ascii=False, indent=indent)
    if indent is None:
        return comment_str
    padding = ' ' * (2 * indent) if indent else ''
    return ''.join(padding + line for line in comment_str.splitlines(True))


def download_comments(youtube_id=None, url=None, output=None, pretty=False, limit=None, language=None, sort=SORT_BY_RECENT):
    try:
        if (not youtube_id and not youtube_url) or not output:
            raise ValueError('you need to specify a Youtube ID/URL and an output filename')

        if os.sep in output:
            outdir = os.path.dirname(output)
            if not os.path.exists(outdir):
                os.makedirs(outdir)

        print('Downloading Youtube comments for', youtube_id or youtube_url)
        downloader = YoutubeCommentDownloader()
        generator = (
            downloader.get_comments(youtube_id, sort, language)
            if youtube_id
            else downloader.get_comments_from_url(youtube_url, sort, language)
        )

        count = 1
        with io.open(output, 'w', encoding='utf8') as fp:
            sys.stdout.write('Downloaded %d comment(s)\r' % count)
            sys.stdout.flush()
            start_time = time.time()

            if pretty:
                fp.write('{\n' + ' ' * INDENT + '"comments": [\n')

            comment = next(generator, None)
            while comment:
                comment_str = to_json(comment, indent=INDENT if pretty else None)
                comment = None if limit and count >= limit else next(generator, None)  # Note that this is the next comment
                comment_str = comment_str + ',' if pretty and comment is not None else comment_str
                print(comment_str.decode('utf-8') if isinstance(comment_str, bytes) else comment_str, file=fp)
                sys.stdout.write('Downloaded %d comment(s)\r' % count)
                sys.stdout.flush()
                count += 1

            if pretty:
                fp.write(' ' * INDENT +']\n}')
        print('\n[{:.2f} seconds] Done!'.format(time.time() - start_time))

    except Exception as e:
        print('Error:', str(e))
        sys.exit(1)


if __name__ == '__main__':
    pass
    # download_comments(youtube_id="ScMzIvxBSi4", output='ScMzIvxBSi4.json', pretty=True, limit=100)