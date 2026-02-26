import os
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import re

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
LINKS_FILE = os.path.join(os.path.dirname(__file__), 'cantera-links.txt')
OUTPUT_FILE = os.path.join(DATA_DIR, 'laliga_2025_26_canteras.json')

# Headers to mimic a real browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
}

# Team names mapping (URL ID to team name)
TEAM_NAMES = {
    '77': 'Athletic Club',
    '87': 'Rayo Vallecano',
    '90': 'Betis',
    '263': 'Alavés',
    '86': 'Madrid',
    '558': 'Celta',
    '559': 'Sevilla',
    '1048': 'Oviedo',
    '88': 'Levante',
    '94': 'Villareal',
    '82': 'Getafe',
    '80': 'Espanyol',
    '81': 'Barcelona',
    '79': 'Osasuna',
    '89': 'Mallorca',
    '285': 'Elche',
    '78': 'Atlético de Madrid',
    '95': 'Valencia',
    '92': 'Real Sociedad',
    '298': 'Girona'
}

def load_team_links():
    """Load team links from cantera-links.txt"""
    teams = []
    try:
        with open(LINKS_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and line.startswith('http'):
                    # Extract team ID from URL
                    team_id = line.rstrip('/').split('/')[-1]
                    team_name = TEAM_NAMES.get(team_id, f"Equipo {team_id}")
                    teams.append({
                        'id': team_id,
                        'name': team_name,
                        'url': line
                    })
        return teams
    except Exception as e:
        print(f"Error loading team links: {e}")
        return []

def extract_table_data(table):
    """Extract data from a table into a list of dictionaries"""
    if not table:
        return []
    
    headers = []
    rows = []
    
    # Get headers (th elements)
    header_row = table.find('thead')
    if header_row:
        headers = [th.get_text(strip=True) for th in header_row.find_all('th')]
    
    # Get data rows
    for row in table.find_all('tr'):
        cells = row.find_all('td')
        if cells:
            row_data = {}
            for i, cell in enumerate(cells):
                header = headers[i] if i < len(headers) else f"col_{i}"
                # Handle special cases like images in cells
                img = cell.find('img')
                if img and 'alt' in img.attrs:
                    row_data[header] = img['alt']
                else:
                    row_data[header] = cell.get_text(strip=True)
            rows.append(row_data)
    
    return rows

def get_team_players(team_url, team_name):
    """Get player data from a team page"""
    print(f"Fetching players for {team_name}...")
    try:
        response = requests.get(team_url, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        team_data = {
            'equipo': team_name,
            'url': team_url,
            'ultima_actualizacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'jugadores': [],
            'estadisticas': {},
            'tablas': {}
        }
        
        # Extract player data
        players_table = soup.find('table', class_='table')
        if players_table:
            team_data['jugadores'] = extract_table_data(players_table)
        
        # Extract other tables (stats, etc.)
        for i, table in enumerate(soup.find_all('table')):
            if table != players_table:  # Skip the players table we already processed
                table_id = f"tabla_{i+1}"
                team_data['tablas'][table_id] = extract_table_data(table)
        
        # Extract team stats if available
        stats_section = soup.find('div', id='team_stats')
        if stats_section:
            stats = {}
            for stat in stats_section.find_all('div', class_='stat-item'):
                stat_name = stat.find('span', class_='stat-name')
                stat_value = stat.find('span', class_='stat-value')
                if stat_name and stat_value:
                    stats[stat_name.get_text(strip=True)] = stat_value.get_text(strip=True)
            team_data['estadisticas'] = stats
        
        return team_data
        
    except Exception as e:
        print(f"Error fetching data for {team_name}: {e}")
        return None

def load_existing_data():
    """Load existing data from JSON file"""
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading existing data: {e}")
    
    # Return default structure if file doesn't exist or error occurs
    return {
        'liga': 'LaLiga 2025/26',
        'fecha_actualizacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'canteras': []
    }

def save_to_json(data):
    """Save data to JSON file"""
    try:
        # Ensure the data directory exists
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        
        # Update the last update timestamp
        data['fecha_actualizacion'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Save to file
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"Data saved to {OUTPUT_FILE}")
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

def main():
    # Load existing data
    data = load_existing_data()
    
    # Get team links
    teams = load_team_links()
    if not teams:
        print("No team links found. Please check cantera-links.txt")
        return
    
    # Process each team
    for team in teams:
        print(f"\nProcessing {team['name']}...")
        
        # Check if team already exists in data
        team_index = next((i for i, t in enumerate(data['canteras']) 
                          if t.get('equipo') == team['name']), None)
        
        # Get team data
        team_data = get_team_players(team['url'], team['name'])
        
        if team_data:
            if team_index is not None:
                # Update existing team data
                data['canteras'][team_index] = team_data
            else:
                # Add new team data
                data['canteras'].append(team_data)
            
            # Save after each team to prevent data loss
            save_to_json(data)
        
        # Be nice to the server
        time.sleep(2)
    
    print("\nAll teams processed successfully!")

if __name__ == "__main__":
    main()