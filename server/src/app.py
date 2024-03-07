from flask import Flask, abort
from flask_cors import CORS
from routers import auth, run_model, handle_data

app = Flask(__name__)
CORS(app, origins="*")
app.register_blueprint(run_model.run_bp)
app.register_blueprint(auth.auth_bp)
app.register_blueprint(handle_data.handle_data_bp)


@app.route("/<path:path>")
def catch_all(path):
    if path == "health-check":
        return "OK"
    else:
        return abort(404)


if __name__ == "__main__":
    app.run(port=3001)
