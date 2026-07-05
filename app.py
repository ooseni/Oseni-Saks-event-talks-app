import os
import requests
import feedparser
from bs4 import BeautifulSoup
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def fetch_and_parse_feed():
    try:
        response = requests.get(FEED_URL, timeout=10)
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        
        releases = []
        for entry in feed.entries:
            date_str = entry.get('title', 'Unknown Date')
            entry_id = entry.get('id', '')
            link = entry.get('link', '')
            
            content_html = ""
            if 'content' in entry and len(entry.content) > 0:
                content_html = entry.content[0].value
            elif 'summary' in entry:
                content_html = entry.summary
                
            updates = []
            if content_html:
                soup = BeautifulSoup(content_html, 'html.parser')
                current_type = "Update"
                current_elements = []
                
                for child in soup.contents:
                    if isinstance(child, str) and not child.strip():
                        continue
                        
                    if child.name == 'h3':
                        if current_elements:
                            updates.append({
                                'type': current_type,
                                'content': "".join(str(el) for el in current_elements).strip()
                            })
                            current_elements = []
                        current_type = child.get_text().strip()
                    else:
                        current_elements.append(child)
                        
                if current_elements:
                    updates.append({
                        'type': current_type,
                        'content': "".join(str(el) for el in current_elements).strip()
                    })
            else:
                updates.append({
                    'type': 'Update',
                    'content': '<p>No content details available.</p>'
                })
                
            releases.append({
                'date': date_str,
                'id': entry_id,
                'link': link,
                'updates': updates
            })
            
        return releases, None
    except Exception as e:
        return None, str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    releases, error = fetch_and_parse_feed()
    if error:
        return jsonify({'error': error}), 500
    return jsonify({'releases': releases})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
