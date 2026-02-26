import requests
from bs4 import BeautifulSoup
import json
import os
from urllib.parse import urljoin
import time
from datetime import datetime

BASE_URL = "https://footystats.org"
LIGA_URL = "https://footystats.org/spain/la-liga/players"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9"
}

def get_soup(url):
    """Get BeautifulSoup object from URL"""
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error getting {url}: {e}")
        return None

def extract_players_from_section(section_name, section_url, stat_type):
    """Extract players from a specific section (top scorers, assists, etc.)"""
    players = []
    page = 1
    has_more = True
    
    while has_more:
        if page > 1:
            current_url = f"{section_url}?page={page}"
        else:
            current_url = section_url
            
        print(f"Fetching {section_name} - Page {page}...")
        soup = get_soup(current_url)
        
        if not soup:
            break
            
        # Find the list container
        list_container = soup.find('ul', class_='ui-list')
        if not list_container:
            break
            
        # Get all player rows
        rows = list_container.find_all('li', class_='list-row')
        if not rows:
            break
            
        for row in rows:
            # Skip if it's a title row or doesn't have the data-page attribute
            if 'list-title' in row.get('class', []) or not row.get('data-page'):
                continue
                
            main_div = row.find('div', class_='main')
            action_div = row.find('div', class_='action')
            
            if not main_div or not action_div:
                continue
                
            # Extract player info
            rank = main_div.find('span', class_='rank')
            player_link = main_div.find('a')
            stat_value = action_div.find('div', class_='small-bubble')
            
            if not all([rank, player_link, stat_value]):
                continue
                
            player = {
                'rank': int(rank.text.strip()),
                'name': player_link.text.strip(),
                'url': urljoin(BASE_URL, player_link['href']),
                stat_type: stat_value.text.split()[0]  # Get just the number
            }
            
            # Add flag if available
            flag = main_div.find('span', class_=lambda c: c and c.startswith('flag-'))
            if flag:
                player['nationality'] = flag['class'][1].replace('flag-', '') if len(flag.get('class', [])) > 1 else None
            
            players.append(player)
        
        # Check if there's a next page
        next_button = soup.find('a', class_='next')
        has_more = bool(next_button and 'disabled' not in next_button.get('class', []))
        page += 1
        
        # Be nice to the server
        time.sleep(1)
    
    return players

def get_section_urls(soup):
    """Get URLs for different sections from the main page"""
    sections = {
        'top_scorers': None,
        'assists': None,
        'penalty_goals': None
    }
    
    # Find all section links
    for link in soup.find_all('a', href=True):
        href = link['href'].lower()
        text = link.get_text(strip=True).lower()
        
        if 'top-scorers' in href or 'top scorers' in text:
            sections['top_scorers'] = urljoin(BASE_URL, link['href'])
        elif 'assists' in href or 'assists' in text:
            sections['assists'] = urljoin(BASE_URL, link['href'])
        elif 'penalty' in href and 'goals' in href:
            sections['penalty_goals'] = urljoin(BASE_URL, link['href'])
    
    # Set default URLs if not found
    if not sections['top_scorers']:
        sections['top_scorers'] = "https://footystats.org/spain/la-liga/top-scorers"
    if not sections['assists']:
        sections['assists'] = "https://footystats.org/spain/la-liga/top-assists"
    if not sections['penalty_goals']:
        sections['penalty_goals'] = "https://footystats.org/spain/la-liga/penalty-goals"
    
    return sections

def main():
    # Get the main page to find section URLs
    print("Fetching main page to find section URLs...")
    soup = get_soup(LIGA_URL)
    if not soup:
        print("Could not fetch the main page")
        return
    
    # Get section URLs
    sections = get_section_urls(soup)
    print("Found the following sections:")
    for name, url in sections.items():
        print(f"- {name}: {url}")
    
    # Scrape each section
    all_data = {
        'liga': 'LaLiga 2025/26',
        'fecha_actualizacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'top_scorers': extract_players_from_section('Top Scorers', sections['top_scorers'], 'goals'),
        'assists': extract_players_from_section('Assists', sections['assists'], 'assists'),
        'penalty_goals': extract_players_from_section('Penalty Goals', sections['penalty_goals'], 'penalty_goals')
    }
    
    # Save to JSON
    output_file = os.path.join('..', 'data', 'laliga_2025_26_footyGoleadores.json')
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nData saved to {output_file}")

if __name__ == "__main__":
    main()