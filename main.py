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


# Function to post a tweet using v2 of the Twitter API


# Function to post a tweet with media using v1.1 of the Twitter API


# Main function to control the flow of the script
def main():
    msg = "This is a test message"
    my_media = r"/Users/mattiabeccari/Documents/Memes/tech/learnC++.jpg"

    client = twitConnection()

    if msg:
        media_id = None

        if my_media:
            try:
                client_v1 = twitConnection_v1()
                media = client_v1.media_upload(filename=my_media)
                media_id = media.media_id
            except Exception as e:
                print(f"Failed to upload media: {e}")
                # Handle the error appropriately (e.g., log it, exit the function, etc.)
        try:
            if media_id:
                response = client.create_tweet(text=msg, media_ids=[media_id])
            else:
                response = client.create_tweet(text=msg)
        except Exception as e:
            print(f"Failed to create tweet: {e}")
            # Handle the error appropriately
    else:
        print("No message to tweet")


# Run the main function if the script is executed
if __name__ == "__main__":
    main()
