import tweepy
from config import CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET


def twitConnection():
    client = tweepy.Client(
        consumer_key=CONSUMER_KEY,
        consumer_secret=CONSUMER_SECRET,
        access_token=ACCESS_TOKEN,
        access_token_secret=ACCESS_TOKEN_SECRET,
    )
    return client


# Connect to Twitter using API v1.1 credentials for media upload
def twitConnection_v1():
    auth = tweepy.OAuth1UserHandler(
        CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET
    )
    return tweepy.API(auth)


def post_tweet(client, msg):
    try:
        response = client.create_tweet(text=msg)
    except Exception as e:
        print(f"Failed to create tweet: {e}")
        # Handle the error appropriately


def post_tweet_with_media(client, client_v1, msg, media_file):
    try:
        # Use the 'name' attribute for the filename
        media_response = client_v1.media_upload(
            filename=media_file.name, file=media_file
        )
        media_id = media_response.media_id_string

        tweet_response = client.create_tweet(text=msg, media_ids=[media_id])
        return tweet_response
    except Exception as e:
        print(f"Failed to post tweet with media: {e}")
        raise e


# def main():
#     msg = "This is a test message"
#     my_media = r"/Users/mattiabeccari/Documents/Memes/tech/learnC++.jpg"

#     client = twitConnection()

#     if msg:
#         if my_media:
#             client_v1 = twitConnection_v1()
#             post_tweet_with_media(client, client_v1, msg, my_media)
#         else:
#             post_tweet(client, msg)
#     else:
#         print("No message to tweet")


if __name__ == "__main__":
    main()
