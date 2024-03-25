from flask import Blueprint, request
from mongo import get_users_collection
import datetime
import os

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
s2d_auth_key = os.getenv("S2D_AUTH_KEY")


@auth_bp.route("/", methods=["POST"], strict_slashes=False)
def upsert_user_data():
    user_data = request.json
    if not user_data:
        return "User data is missing.", 400

    users = get_users_collection()
    if users is None:
        return "MongoDB connection failed.", 500

    if user_data["authKey"] != s2d_auth_key:
        return "Invalid auth key.", 401

    upsert_result = users.update_one(
        {"email": user_data["email"]},
        {
            "$set": {"authKey": s2d_auth_key},
            "$setOnInsert": {"runCount": 0, "createdAt": datetime.datetime.now()},
        },
        upsert=True,
    )
    if upsert_result.acknowledged:
        return "User data upserted", 200
    else:
        return "Failed to upsert user data.", 404
