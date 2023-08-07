import requests
from bs4 import BeautifulSoup
import wikipediaapi

wiki_url = "https://en.wikipedia.org/wiki/Xavier_Becerra"

def scrape_wikipedia_page(url):
  response = requests.get(url)
  soup = BeautifulSoup(response.text, "html.parser")

  title = soup.find("main", {"id": "content"}).text
  para = ""
  for paragraph in soup("p"):
    para = paragraph
    break

  return title, para

def search_on_wikipedia(query):
  wiki = wikipediaapi.Wikipedia('en')
  page = wiki.page(query)

  if page.exists():
    print("Title:", page.title)
    print("Summary:")
    print(page.summary[:500])  # Display first 500 characters of summary
    print("Full Article URL:", page.fullurl)
  else:
    print("Page not found on Wikipedia.")

if __name__ == "__main__":
  # search_query = input("Enter search query: ")
  # search_on_wikipedia(search_query)
  page_title, page_first_paragraph = scrape_wikipedia_page(wiki_url)
  print("Title:", page_title)
  print("First Paragraph:", page_first_paragraph)