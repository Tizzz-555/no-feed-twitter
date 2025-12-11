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
        from config import SECRET_TOKEN
    except ImportError:
        SECRET_TOKEN = None

    try:
        msg = request.form.get("text")
        media_files = request.files.getlist("media")
        provided_token = request.form.get("token")

        # If token doesn't match, fake success (demo mode)
        if provided_token != SECRET_TOKEN:
            return jsonify(success=True, demo=True)

        client = twitConnection()
        client_v1 = twitConnection_v1()
        media_ids = []

        for media in media_files:
            media_file = BytesIO(media.read())
            media_file.name = media.filename
            response = client_v1.media_upload(filename=media.filename, file=media_file)
            media_ids.append(response.media_id_string)

        if media_ids:
            post_tweet_with_media(client, msg, media_ids)
        else:
            post_tweet(client, msg)

        return jsonify(success=True)
    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()
        return jsonify(success=False, error=str(e)), 500


if __name__ == "__main__":
    app.run(debug=True)
