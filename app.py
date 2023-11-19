from flask import Flask, render_template, request, jsonify
from main import twitConnection, twitConnection_v1, post_tweet, post_tweet_with_media

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/post_tweet", methods=["POST"])
def handle_tweet_post():
    msg = request.form.get("text")
    media = request.files.get("media")
    client = twitConnection()
    client_v1 = twitConnection_v1()

    if media:
        # Read the file into memory
        media_file = media.read()
        # Use Tweepy to upload the media file
        response = client_v1.media_upload(filename=media.filename, file=media_file)
        media_id = response.media_id_string
        # Then create a tweet with the media
        post_tweet_with_media(client, client_v1, msg, media_id)
    else:
        post_tweet(client, msg)

    return jsonify(
        success=True
    )  # Consider returning success based on the outcome of the post


if __name__ == "__main__":
    app.run(debug=True)
    app.config["TEMPLATES_AUTO_RELOAD"] = True
