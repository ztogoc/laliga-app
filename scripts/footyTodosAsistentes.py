import json
import os
import sys
from bs4 import BeautifulSoup
from datetime import datetime

def extract_assists(html_content):
    """Extract assists data from HTML content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    players = []
    
    # Find all player rows
    rows = soup.find_all('li', class_='list-row')
    
    for row in rows:
        # Skip the title row and text rows
        if 'list-title' in row.get('class', []) or 'text' in row.get('class', []):
            continue
            
        try:
            # Extract player info
            main_div = row.find('div', class_='main')
            action_div = row.find('div', class_='action')
            
            if not main_div or not action_div:
                continue
                
            rank = main_div.find('span', class_='rank')
            player_link = main_div.find('a')
            stat_value = action_div.find('div', class_='small-bubble')
            
            if not all([rank, player_link, stat_value]):
                continue
                
            # Extract nationality from flag class
            flag = main_div.find('span', class_=lambda c: c and c.startswith('flag-'))
            nationality = flag['class'][1].replace('flag-', '') if flag and len(flag.get('class', [])) > 1 else None
            
            player = {
                'rank': int(rank.text.strip('. ')),
                'name': player_link.text.strip(),
                'url': f"https://footystats.org{player_link['href']}",
                'assists': int(stat_value.text.strip().split()[0]),
                'nationality': nationality
            }
            
            players.append(player)
            
        except Exception as e:
            print(f"Error processing player row: {e}")
            continue
            
    return players

def main():
    # Check if HTML file exists
    html_file = 'assists_page.html'
    if not os.path.exists(html_file):
        print(f"Error: The file '{html_file}' was not found in the current directory.")
        print("\nTo use this script:")
        print("1. Open the assists page in your browser")
        print("2. Right-click and select 'View Page Source' or press Ctrl+U")
        print("3. Save the complete HTML to a file named 'assists_page.html' in the scripts folder")
        print("4. Run this script again")
        sys.exit(1)
    
    try:
        # Read the HTML from a file
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Extract the data
        players = extract_assists(html_content)
        
        if not players:
            print("No player data found in the HTML file.")
            print("Please make sure the HTML file contains the complete page source.")
            sys.exit(1)
        
        # Prepare the output data
        output_data = {
            'liga': 'LaLiga 2025/26',
            'fecha_actualizacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'asistentes': players
        }
        
        # Save to JSON
        output_file = os.path.join('..', 'data', 'laliga_2025_26_footyAsistentes.json')
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"Data saved to {output_file}")
        print(f"Total players processed: {len(players)}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
    