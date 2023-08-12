from flask import Flask, request
import flask
import json
from flask_cors import CORS
import os
import mysql.connector
from mysql.connector import connect, Error
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import wikipediaapi
import re

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
	return "Hello, World!"

@app.route('/official', methods=["GET"])
def officials():
	print("officials cicero api endpoint reached...")
	# gets officials from cicero api
	if request.method == "GET":
		with open("officialsample.json", "r") as f:
			data = json.load(f)
			return flask.jsonify(data)


@app.route('/officialdetails', methods=["GET"])
def details():
	print("details (scraping/api) endpoint reached...")
	search_query = get_search_name()
	wiki_page_url = search_on_wikipedia(search_query)
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
  

@app.route('/officialsearch', methods=["POST"])
def search():
	print("search endpoint reached...")
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

@app.route('/api', methods=["GET", "POST"])
def api():
	print("api endpoint reached...")

	# gets officials from cicero api
	if request.method == "GET":
		print("Testing endpoint reached...")
		with open("sample3.json", "r") as f:
			data = json.load(f)
			return flask.jsonify(data)
		# return flask.jsonify(responseJSON)
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
		# update_address_value(address)
		return flask.Response(response=json.dumps(return_data), status=201)

wiki_url = "https://en.wikipedia.org/wiki/Xavier_Becerra"

def scrape_wikipedia_page(url):
  response = requests.get(url)
  soup = BeautifulSoup(response.text, 'html.parser')
  body_content = soup.find('div',id='mw-content-text')
  scraped_data = str(body_content.prettify())
  return scraped_data

# searches official on wikipedia api to get url of page if it exists
def search_on_wikipedia(query):
  wiki = wikipediaapi.Wikipedia(os.getenv('WIKIPEDIA_USER_AGENT'),'en')
  page = wiki.page(query)

  if page.exists():
    return page.fullurl
  else:
    return None

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