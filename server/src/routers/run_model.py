from flask import Blueprint, request
from mongo import get_users_collection
import os
from uuid import uuid1
import base64
from model.run_batch import run_batch

run_bp = Blueprint("run", __name__, url_prefix="/run")


def increase_run_count(email):
    users = get_users_collection()
    if users is None:
        return "MongoDB connection failed.", 500

    update_result = users.update_one({"email": email}, {"$inc": {"runCount": 1}})
    if update_result.acknowledged:
        return update_result, 200
    else:
        return "No user matches to the email.", 404


def get_model_result():
    run_batch()
    return {}, 200


@run_bp.route("/", methods=["POST"], strict_slashes=False)
def run_model():
    email = request.json.get("email")

    print(increase_run_count(email))

    width = request.json.get("width")
    height = request.json.get("height")
    bytes = request.json.get("bytes")

    print(width, height)

    if not bytes:
        return "No Image.", 400

    instance_id = uuid1()
    # model_path = os.path.join(os.getcwd(), "../../model/UIED/run_single.py")
    # input_path = os.path.join(os.getcwd(), f"../../buffer/input/{instance_id}.jpg")
    # output_path = os.path.join(os.getcwd(), f"../../buffer/output/{instance_id}")

    # image_buf = base64.b64decode(bytes)

    # try:
    #     with open(input_path, "wb") as f:
    #         f.write(image_buf)
    # except Exception as e:
    #     print(e)
    #     return "Internal Server Error: Couldn't save the image.", 500

    # print(f"{len(image_buf)} size ({width} X {height}) file was saved.")

    result, status = get_model_result()
    if status > 299:
        return result, status

    return result, status
