from flask import Flask, request
import flask
import json
import requests
from flask_cors import CORS
import os
import mysql.connector
from mysql.connector import connect, Error
from dotenv import load_dotenv
import wikipediaapi
from bs4 import BeautifulSoup

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
	return "Hello, World!"

@app.route('/officialdetails', methods=["GET", "POST"])
def details():
	if request.method == "GET":
		print("details (scraping/api) endpoint reached...")
		search_query = get_search_name()
		wiki_page_url = search_for_page(search_query)
		# if page exists, scrape page
		if (wiki_page_url):
			print("scraped wikipedia page")
			scraped_content = scrape_wikipedia_page(wiki_page_url)
			return flask.jsonify({"status":"success","scraping":"success","html":scraped_content})
		# if wiki page doesn't exist, return Cicero API details
		return_data = {
			"status": "success",
			"scraping": "failed",
			"html": None
		}
		return flask.Response(response=json.dumps(return_data), status=200)

	if request.method == "POST":
		received_data = request.get_json()
		name = received_data['search-name']
		print("name to search: "+name)
		return_data = {
			"status": "success",
			"message": f"received: {name}"
		}
		update_search_name_value(name)
		return flask.Response(response=json.dumps(return_data), status=201)

# searches official on wikipedia api to get url of page if it exists
def search_for_page(query):
  wiki = wikipediaapi.Wikipedia(os.getenv('WIKIPEDIA_USER_AGENT'),'en')
  page = wiki.page(query)
  if page.exists():
    return page.fullurl
  else:
    return None

def scrape_wikipedia_page(url):
  response = requests.get(url)
  soup = BeautifulSoup(response.text, 'html.parser')
  body_content = soup.find('div',id='mw-content-text')
  scraped_data = str(body_content.prettify())
  return scraped_data

def update_search_name_value(name):
	update_search_name_query = """
		UPDATE official SET search_name = '%s' WHERE status = 'current';
	""" % name
	try:
		print("Connecting to sql")
		with connect(
			host="localhost",
			user = os.getenv("MYSQL_USER"),
			password = os.getenv("MYSQL_PASS"),
  		database="address_db",
		) as connection:
			print("Updating search name for current official...")
			with connection.cursor() as cursor:
				cursor.execute(update_search_name_query)
				connection.commit()
	except Error as e:
		print(e)

def get_search_name():
	get_search_name_query = """
		SELECT search_name FROM official WHERE status = 'current';
	""" 
	try:
		print("Connecting to sql")
		with connect(
			host="localhost",
			user = os.getenv("MYSQL_USER"),
			password = os.getenv("MYSQL_PASS"),
  		database="address_db",
		) as connection:
			print("Getting search name for current official...")
			with connection.cursor() as cursor:
				cursor.execute(get_search_name_query)
				result = cursor.fetchone()
				name = result[0]
				return name
	except Error as e:
		print(e)

@app.route('/official', methods=["GET", "POST"])
def official():
	print("api endpoint reached...")

	# gets officials from cicero api
	if request.method == "GET":
		API_KEY = os.getenv("CICERO_API")
		data = ["",""]
		data = get_addr_lastname_value(data)
		address = data[0]
		lastname = data[1]
		print("Check if address was received in get: %s" % address)
		print("Check if last name was received in get: %s" % lastname)
		print("Fetching specific official data from cicero...")
		url = "https://cicero.azavea.com/v3.1/official?last_name=%s&valid_range=ALL&search_loc=%s&format=json&key=%s" % (lastname, address, API_KEY)
		print("url: " + url)
		response = requests.get(url)
		responseJSON = response.json()
		return flask.jsonify(responseJSON)

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

get_current_address_query = """
	SELECT value FROM variables WHERE name = 'address';"""
 
get_current_lastname_query = """
	SELECT last_name FROM official WHERE status = 'current';"""

# gets address value from database
def get_addr_lastname_value(ret):
	try:
		with connect(
			host="localhost",
			user = os.getenv("MYSQL_USER"),
			password = os.getenv("MYSQL_PASS"),
  		database="address_db",
		) as connection:
			with connection.cursor() as cursor:
				cursor.execute(get_current_address_query)
				result = cursor.fetchone()
				ret[0] = result[0]
				print("address: %s" % ret[0])
				cursor.execute(get_current_lastname_query)
				result = cursor.fetchone()
				ret[1] = result[0]
				print("lastname: %s" % ret[1])
				return ret
	except Error as e:
		print(e)

def update_lastname_value(last):
	update_lastname_query = """
		INSERT INTO official (status,last_name) VALUES ('current','%s')
			ON DUPLICATE KEY UPDATE last_name = '%s';
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

@app.route('/officials', methods=["GET", "POST"])
def officials():
	print("api endpoint reached...")
	# gets officials from cicero api
	if request.method == "GET":
		API_KEY = os.getenv("CICERO_API")
		address = get_address_value()
		print("Check if address was received in get: %s" % address)
		print("fetching from cicero")
		url = "https://cicero.azavea.com/v3.1/official?format=json&order=district_type&max=199&search_loc=%s&key=%s" % (address, API_KEY)
		response = requests.get(url)
		responseJSON = response.json()
		return flask.jsonify(responseJSON)

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

# updates address value in database
def update_address_value(addr):
	update_address_query = """
 		UPDATE variables SET value = '%s' WHERE name = 'address';
	""" % (addr)
	try:
		print("Connecting to sql")
		with connect(
			host="localhost",
			user = os.getenv("MYSQL_USER"),
			password = os.getenv("MYSQL_PASS"),
  		database="address_db",
		) as connection:
			with connection.cursor() as cursor:
				cursor.execute(update_address_query)
				connection.commit()
	except Error as e:
		print(e)

# gets address value from database
def get_address_value():
	get_address_value_query = """
  	SELECT value FROM variables WHERE name = 'address';
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
				result = cursor.fetchone()
				return result[0]
	except Error as e:
		print(e)

if __name__ == "__main__":
	app.run("localhost", 6969)