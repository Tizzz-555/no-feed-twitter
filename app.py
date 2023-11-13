from flask import Flask, render_template, request, jsonify
from main import (
    post_tweet,
    post_tweet_with_media,
)  # assuming main.py contains your Twitter functionality

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/post_tweet", methods=["POST"])
def handle_tweet_post():
    data = request.form
    msg = data["text"]
    media = request.files["media"] if "media" in request.files else None
    my_media_path = None

    if media:
        my_media_path = save_media_file(media)  # You need to implement this method

    # Now call your Twitter functionality
    if my_media_path:
        post_tweet_with_media(msg, my_media_path)
    else:
        post_tweet(msg)

    return jsonify(success=True)


if __name__ == "__main__":
    app.run(debug=True)
