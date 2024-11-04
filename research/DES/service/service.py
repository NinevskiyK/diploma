from flask import Flask, request
from typing import Mapping
import time
from threading import Lock

app = Flask(__name__)
store: Mapping = {}
lock = Lock()

@app.route("/ping")
def ping():
    return "pong"

@app.route("/get/<key>")
def get(key: str):
    with lock:
        time.sleep(1)

        res = store.get(key, None)
        if res is None:
            return "Not Found", 404
        else:
            return res, 200

@app.route("/insert/<key>", methods=['POST'])
def insert(key: str):
    with lock:
        time.sleep(1)

        value = request.args.get("value")
        store[key] = value
        return "ok"

if __name__ == "__main__":
    app.run(threaded=False)