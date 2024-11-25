from flask import Flask, request
import time
from threading import Lock

app = Flask(__name__)
lock = Lock()

@app.route("/sleep")
def sleep():
    print("new")
    with lock:
        time.sleep(int(request.args.get('time'))/1000)
        return "ok"

if __name__ == "__main__":
    app.run(port=1234)