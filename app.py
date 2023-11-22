from flask import Flask, render_template, request, jsonify
from main import twitConnection, twitConnection_v1, post_tweet, post_tweet_with_media

# For debugging
import traceback
from io import BytesIO

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/post_tweet", methods=["POST"])
def handle_tweet_post():
    try:
        msg = request.form.get("text")
        media = request.files.get("media")
        client = twitConnection()
        client_v1 = twitConnection_v1()

        if media:
            media_file = BytesIO(media.read())
            media_file.name = media.filename

            # Call post_tweet_with_media with the media file object
            post_tweet_with_media(client, client_v1, msg, media_file)
        else:
            post_tweet(client, msg)

        return jsonify(success=True)
    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()
        return jsonify(success=False, error=str(e)), 500


if __name__ == "__main__":
    app.run(debug=True)
