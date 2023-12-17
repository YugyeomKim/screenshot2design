from flask import Blueprint, request
from mongo import get_users_collection, get_stat_collection

handle_data_bp = Blueprint("handle_data", __name__, url_prefix="/handle_data")


@handle_data_bp.route("/users", methods=["POST"], strict_slashes=False)
def handle_userdata():
    email = request.json.get("email")
    user_data = request.json.get("user_data")
    if not email or not user_data:
        return "User Information missing.", 400

    users = get_users_collection()
    if users is None:
        return "MongoDB connection failed.", 500

    updating_data = {}
    for key, value in user_data.items():
        updating_data[key] = value

    update_result = users.update_one({"email": email}, {"$set": updating_data})
    if update_result.acknowledged:
        return "Survey data updated", 200
    else:
        return "No user matches to the email, for survey data.", 404


@handle_data_bp.route("/stat", methods=["POST"], strict_slashes=False)
def handle_stat():
    stat_type = request.json.get("type")
    payload = request.json.get("payload")
    if not stat_type or not payload:
        return "payload is missing.", 400

    stat = get_stat_collection()
    if stat is None:
        return "MongoDB connection failed.", 500

    if stat_type == "increment":
        metric = payload["metric"]
        update_result = stat.update_one({"metric": metric}, {"$inc": {"count": 1}})
    elif stat_type == "decrement":
        metric = payload["metric"]
        update_result = stat.update_one({"metric": metric}, {"$inc": {"count": -1}})
    elif stat_type == "subfield-increment":
        metric, subfield = payload["metric"], payload["subfield"]
        update_result = stat.update_one({"metric": metric}, {"$inc": {subfield: 1}})
    elif stat_type == "subfield-decrement":
        metric, subfield = payload["metric"], payload["subfield"]
        update_result = stat.update_one({"metric": metric}, {"$inc": {subfield: -1}})
    else:
        return "Unknown type", 400

    if update_result.acknowledged:
        return "Survey data updated", 200
    else:
        return "No user matches to the email, for survey data.", 404
