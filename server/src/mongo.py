from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv(verbose=True)
uri = MONGODB_URI = os.getenv("MONGODB_URI")

# Create a new client and connect to the server
mongo_client = MongoClient(uri, server_api=ServerApi("1"))

# Send a ping to confirm a successful connection
try:
    mongo_client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


def get_collection(collection_name):
    return mongo_client["screenshot2design"][collection_name]


def get_users_collection():
    return get_collection("users")


def get_stat_collection():
    return get_collection("stat")
