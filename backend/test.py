import mysql.connector
from mysql.connector import connect, Error
import os
from dotenv import load_dotenv
import wikipediaapi
import requests
from bs4 import BeautifulSoup

load_dotenv()

from getpass import getpass

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
				print("got name: "+name)
				return name
	except Error as e:
		print(e)

def search_on_wikipedia(query):
  wiki = wikipediaapi.Wikipedia(os.getenv('WIKIPEDIA_USER_AGENT'),'en')
  page = wiki.page(query)

  if page.exists():
    return page.fullurl
  else:
    return None
  
def scrape_wikipedia_page(url):
  response = requests.get(url)
  soup = BeautifulSoup(response.text, 'html.parser')
  body_content = soup.find(id='bodyContent')
  return body_content
  
  
if __name__ == "__main__":
  search_query = get_search_name()
  print(scrape_wikipedia_page(search_on_wikipedia(search_query)))
  
  # page_title, page_first_paragraph = scrape_wikipedia_page(wiki_url)
  # print("Title:", page_title)
  # print("First Paragraph:", page_first_paragraph)