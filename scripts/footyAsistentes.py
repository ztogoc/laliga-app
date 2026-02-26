def parse_players(html: str) -> List[Dict[str, Any]]:
    """Parse the HTML to extract player data from the Assists section."""
    soup = BeautifulSoup(html, 'html.parser')
    players = []
    
    # Find the Assists Table section
    assists_heading = soup.find('h2', string='Assists Table')
    if not assists_heading:
        print("Could not find Assists Table heading")
        return players
    
    # Navigate to the parent ul containing the assists list
    assists_list = assists_heading.find_parent('div', class_='ui-col')
    if not assists_list:
        print("Could not find assists list container")
        return players
    
    # Find all player rows
    player_rows = assists_list.find_all('li', class_='list-row')
    print(f"Found {len(player_rows)} player rows")
    
    for row in player_rows:
        try:
            # Skip if it's a text row or hidden row
            if 'text' in row.get('class', []) or row.get('style') == 'display: none;':
                continue
                
            # Extract player name from the title attribute of the link
            name_elem = row.select_one('div.main a')
            if not name_elem:
                continue
                
            name = name_elem.get('title', '').replace('Stats for ', '').strip()
            if not name:
                name = name_elem.get_text(strip=True)
                
            # Extract assists from the small-bubble div
            assists_elem = row.select_one('div.action div.small-bubble')
            if not assists_elem:
                continue
                
            # Get the number part before the "Assists" text
            assists_text = assists_elem.get_text(strip=True).split()[0]
            try:
                assists = int(assists_text)
            except (ValueError, IndexError):
                continue
                
            players.append({
                "nombre": name,
                "asistencias": assists
            })
            
        except Exception as e:
            print(f"Error processing player: {e}")
            continue
            
    return players