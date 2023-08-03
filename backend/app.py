from flask import Flask, request
import flask
import json
import requests
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
	return "Hello, World!"

@app.route('/users', methods=["GET", "POST"])
def users():
	print("users endpoint reached...")
	if request.method == "GET":
		with open("users.json", "r") as f:
			data = json.load(f)
			data.append({
				"username": "user4",
				"pets": ["hamster"]
			})

			return flask.jsonify(data)
	if request.method == "POST":
		received_data = request.get_json()
		print(f"received data: {received_data}")
		message = received_data['data']
		return_data = {
			"status": "success",
			"message": f"received: {message}"
		}
		return flask.Response(response=json.dumps(return_data), status=201)

@app.route('/api', methods=["GET", "POST"])
def api():
	print("api endpoint reached...")
	API_KEY = os.environ.get("CICERO_API")
	if request.method == "GET":
		url = "https://cicero.azavea.com/v3.1/official?search_loc=%s&key=%s" % (address, API_KEY)
		response = requests.get(url)
		return flask.jsonify(response)
	if request.method == "POST":
		received_data = request.get_json()
		address = received_data['data']
		print(f"received address: {received_data}")
		message = received_data['data']
		return_data = {
			"status": "success",
			"message": f"received: {message}"
		}
		# response = requests.get(url)

		return flask.Response(response=json.dumps(return_data), status=201)

if __name__ == "__main__":
	app.run("localhost", 6969)