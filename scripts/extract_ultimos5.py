import json
from datetime import datetime
from collections import defaultdict

def extract_last_5_results():
    """Extract last 5 match results for each team from calendario.json"""
    
    # Load calendario data
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(os.path.dirname(script_dir), 'data', 'laliga_2025_26_calendario.json')
    with open(data_file, 'r', encoding='utf-8') as f:
        calendario = json.load(f)
    
    # Store all matches per team
    team_matches = defaultdict(list)
    
    # Process all rounds
    for round_num, matches in calendario.items():
        for match in matches:
            # Only process finished matches
            if match.get('status') == 'Finalizado' and match.get('home_score') is not None:
                home_team = match['home_team']
                away_team = match['away_team']
                home_score = match['home_score']
                away_score = match['away_score']
                date = match.get('date', '')
                
                # Determine result for home team
                if home_score > away_score:
                    home_result = 'W'  # Win
                    away_result = 'L'  # Loss
                elif home_score < away_score:
                    home_result = 'L'  # Loss
                    away_result = 'W'  # Win
                else:
                    home_result = 'D'  # Draw
                    away_result = 'D'  # Draw
                
                # Add to home team matches
                team_matches[home_team].append({
                    'date': date,
                    'opponent': away_team,
                    'venue': 'H',  # Home
                    'result': home_result,
                    'score_for': home_score,
                    'score_against': away_score,
                    'round': int(round_num)
                })
                
                # Add to away team matches
                team_matches[away_team].append({
                    'date': date,
                    'opponent': home_team,
                    'venue': 'A',  # Away
                    'result': away_result,
                    'score_for': away_score,
                    'score_against': home_score,
                    'round': int(round_num)
                })
    
    # Load existing noticias data if exists
    existing_data = {}
    existing_file = os.path.join(os.path.dirname(script_dir), 'data', 'laliga_2025_26_ultimos5.json')
    if os.path.exists(existing_file):
        try:
            with open(existing_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except:
            pass
    
    # Sort matches by date for each team and get last 5
    ultimos_5 = {}
    
    for team, matches in team_matches.items():
        # Sort by date (most recent first)
        sorted_matches = sorted(matches, key=lambda x: x['date'], reverse=True)
        # Get last 5
        last_5 = sorted_matches[:5]
        # Reverse to show oldest first (like in the image: left to right = oldest to newest)
        last_5.reverse()
        
        # Calculate stats
        wins = sum(1 for m in last_5 if m['result'] == 'W')
        draws = sum(1 for m in last_5 if m['result'] == 'D')
        losses = sum(1 for m in last_5 if m['result'] == 'L')
        
        ultimos_5[team] = {
            'form': [m['result'] for m in last_5],
            'matches': last_5,
            'stats': {
                'played': len(last_5),
                'wins': wins,
                'draws': draws,
                'losses': losses,
                'points': wins * 3 + draws
            }
        }
        
        # Preserve news_links from existing data
        if team in existing_data and 'news_links' in existing_data[team]:
            ultimos_5[team]['news_links'] = existing_data[team]['news_links']
    
    # Save to JSON
    output_file = os.path.join(os.path.dirname(script_dir), 'data', 'laliga_2025_26_ultimos5.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(ultimos_5, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Extracted last 5 results for {len(ultimos_5)} teams")
    print(f"📁 Saved to: {output_file}")
    
    # Print sample
    print("\n📊 Sample teams:")
    for team in list(ultimos_5.keys())[:3]:
        data = ultimos_5[team]
        print(f"  {team}: {' '.join(data['form'])} ({data['stats']['points']} pts)")

if __name__ == '__main__':
    extract_last_5_results()
