from flask import Flask, request
import flask
import json
import requests
from flask_cors import CORS
import os
import mysql.connector
from mysql.connector import connect, Error
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
	return "Hello, World!"

@app.route('/test', methods=["GET"])
def test():
	print("Testing endpoint reached...")
	with open("sample3.json", "r") as f:
		data = json.load(f)
		return flask.jsonify(data)

@app.route('/official', methods=["GET", "POST"])
def officials():
	print("api endpoint reached...")

	# gets officials from cicero api
	if request.method == "GET":
		API_KEY = os.getenv("CICERO_API")
		address = ["",""]
		address = get_address_value(address)
		print("Check if address was received in get: %s" % address[0])
		# if address[0].lower() == address[1].lower():
		# 	print("address is equal!")
		# 	with open("current.json", "r") as f:
		# 		data = json.load(f)
		# 		return flask.jsonify(data)
		# else:
		print("fetching from cicero")
		url = "https://cicero.azavea.com/v3.1/official?format=json&order=district_type&max=199&search_loc=%s&key=%s" % (address[0], API_KEY)
		response = requests.get(url)
		responseJSON = response.json()
		# update_current(responseJSON) 
		return flask.jsonify(responseJSON)
		# with open("current.json", "w") as outfile:
		# 	outfile.write(json.dumps(response.json()))
		# json_string = response.content.decode('utf-8')
		# data = json.loads(json_string)
		# json_data = json.dumps(data)
		# put_sample_in_database(json_data)

	# get address input from user
	if request.method == "POST":
		received_data = request.get_json()
		last_name = received_data['last-name']
		print(last_name)
		return_data = {
			"status": "success",
			"message": f"received: {last_name}"
		}
		update_lastname_value(last_name)
		return flask.Response(response=json.dumps(return_data), status=201)

def update_lastname_value(last):
	update_lastname_query = """
		INSERT INTO official(status,last-name) VALUES ('current','%s')
			ON DUPLICATE KEY UPDATE last-name = '%s';
	""" % (last, last)
	try:
		print("Connecting to sql")
		with connect(
			host="localhost",
			user = os.getenv("MYSQL_USER"),
			password = os.getenv("MYSQL_PASS"),
  		database="address_db",
		) as connection:
			print("Updating last name for current official...")
			with connection.cursor() as cursor:
				cursor.execute(update_lastname_query)
				connection.commit()
	except Error as e:
		print(e)

@app.route('/api', methods=["GET", "POST"])
def api():
	print("api endpoint reached...")

	# gets officials from cicero api
	if request.method == "GET":
		API_KEY = os.getenv("CICERO_API")
		address = ["",""]
		address = get_address_value(address)
		print("Check if address was received in get: %s" % address[0])
		# if address[0].lower() == address[1].lower():
		# 	print("address is equal!")
		# 	with open("current.json", "r") as f:
		# 		data = json.load(f)
		# 		return flask.jsonify(data)
		# else:
		print("fetching from cicero")
		url = "https://cicero.azavea.com/v3.1/official?format=json&order=district_type&max=199&search_loc=%s&key=%s" % (address[0], API_KEY)
		response = requests.get(url)
		responseJSON = response.json()
		# update_current(responseJSON) 
		return flask.jsonify(responseJSON)
		# with open("current.json", "w") as outfile:
		# 	outfile.write(json.dumps(response.json()))
		# json_string = response.content.decode('utf-8')
		# data = json.loads(json_string)
		# json_data = json.dumps(data)
		# put_sample_in_database(json_data)

	# get address input from user
	if request.method == "POST":
		received_data = request.get_json()
		address = received_data['data']
		print(address)
		return_data = {
			"status": "success",
			"message": f"received: {address}"
		}
		update_address_value(address)
		return flask.Response(response=json.dumps(return_data), status=201)

create_samples_table_query = """
CREATE TABLE samples(
	id int auto_increment primary key,
	details longtext
)
"""

# put sample of api result in database
# def put_sample_in_database(sample):
# 	insert_sample_query = """
# 		INSERT INTO samples(details) VALUES('%s');
#   	""", (sample)
# 	try:
# 		print("Putting sample in database")
# 		with connect(
# 			host="localhost",
# 			user = os.getenv("MYSQL_USER"),
# 			password = os.getenv("MYSQL_PASS"),
#   		database="address_db",
# 		) as connection:
# 			with connection.cursor() as cursor:
# 				cursor.execute(insert_sample_query)
# 				connection.commit()
# 	except Error as e:
# 		print(e)

def update_current(response):
	outfile = open("current.json", "w")
	outfile.write(json.dumps(response))
	outfile.close()

# updates address value in database
def update_address_value(addr):
	update_address_query = [
   	"set @prev = (select value FROM variables WHERE name='address');",
    "update variables set value = @prev where name = 'prev_address';",
    "update variables set value = '%s' where name = 'address';" % (addr)]
  
	try:
		print("Connecting to sql")
		with connect(
			host="localhost",
			user = os.getenv("MYSQL_USER"),
			password = os.getenv("MYSQL_PASS"),
  		database="address_db",
		) as connection:
			with connection.cursor() as cursor:
				for q in update_address_query:
					cursor.execute(q)
				connection.commit()
	except Error as e:
		print(e)

# gets address value from database
def get_address_value(ret):
	get_address_value_query = """
		SELECT * FROM variables;
		"""
	try:
		with connect(
			host="localhost",
			user = os.getenv("MYSQL_USER"),
			password = os.getenv("MYSQL_PASS"),
  		database="address_db",
		) as connection:
			with connection.cursor() as cursor:
				cursor.execute(get_address_value_query)
				result = cursor.fetchmany(2)
				i = 0
				for row in result:
					ret[i] = row[1]
					print("ret[i]: %s" % ret[i])
					i =+ 1
				return ret
	except Error as e:
		print(e)

create_variables_table_query = """
CREATE TABLE variables(
	name VARCHAR(15) PRIMARY KEY,
	value VARCHAR(100)
)
"""

if __name__ == "__main__":
	try:
		print("Connecting to sql")
		with connect(
			host="localhost",
			user = os.getenv("MYSQL_USER"),
			password = os.getenv("MYSQL_PASS"),
  		database="address_db",
		) as connection:
			# with connection.cursor() as cursor:
			# 	cursor.execute(modify_table)
			# 	connection.commit()
			print(connection)
	except Error as e:
		print(e)
	app.run("localhost", 6969)