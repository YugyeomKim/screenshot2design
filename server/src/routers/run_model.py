from flask import Blueprint, request
from mongo import get_users_collection
import os
from uuid import uuid1
from model.run_batch import run_batch


run_bp = Blueprint("run", __name__, url_prefix="/run")


def increase_run_count(email):
    users = get_users_collection()
    if users is None:
        return "MongoDB connection failed.", 500

    update_result = users.update_one({"email": email}, {"$inc": {"runCount": 1}})
    if update_result.acknowledged:
        return f"Increased run count of {update_result.matched_count} users", 200
    else:
        return "No user matches to the email.", 404


@run_bp.route("/", methods=["POST"], strict_slashes=False)
def run_model():
    email = request.json.get("email")
    print(increase_run_count(email))

    image_bytes_lists = request.json.get("imageBytes")

    if not image_bytes_lists:
        return "No Image.", 400

    input_root = os.path.abspath("./buffer/input")
    if not os.path.exists(input_root):
        os.makedirs(input_root)

    image_names = []
    for i, image_bytes_list in enumerate(image_bytes_lists):
        image_bytes = bytes(image_bytes_list)

        image_name = f"{uuid1()}_{i}"
        image_names.append(image_name)
        input_path = os.path.join(input_root, f"{image_name}.jpg")
        with open(input_path, "wb") as f:
            f.write(image_bytes)

    try:
        result = run_batch(image_names)
    except Exception as e:
        return str(e), 500

    return result, 200
