import mysql.connector
from mysql.connector import connect, Error
import os
from dotenv import load_dotenv
load_dotenv()

from getpass import getpass

get_address_value_query = """
	SELECT value FROM variables WHERE name='address'
	"""
print("In get_address_value")
try:
	with connect(
		host="localhost",
		user = os.getenv("MYSQL_USER"),
		password = os.getenv("MYSQL_PASS"),
		database="address_db",
	) as connection:
		with connection.cursor() as cursor:
			address_value = cursor.execute(get_address_value_query)
			value = cursor.fetchone()
			print(value[0])
except Error as e:
	print(e)
