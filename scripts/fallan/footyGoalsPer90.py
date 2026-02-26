import cloudscraper
from bs4 import BeautifulSoup
import json
import time
import random
import sys
import re

def create_scraper():
    return cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
    )

def fetch_with_retry(url, max_retries=3, delay_range=(2, 5)):
    scraper = create_scraper()
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                delay = random.uniform(delay_range[0], delay_range[1])
                print(f"Esperando {delay:.1f}s antes del reintento {attempt + 1}...")
                time.sleep(delay)
            
            print(f"Intento {attempt + 1}/{max_retries}: {url}")
            res = scraper.get(url, timeout=30)
            res.raise_for_status()
            print(f"OK Conexion exitosa (Status: {res.status_code})")
            return res
        except Exception as e:
            print(f"ERROR en intento {attempt + 1}: {str(e)[:60]}")
            if attempt == max_retries - 1:
                raise
    return None

def main():
    url = "https://footystats.org/spain/la-liga"
    
    try:
        res = fetch_with_retry(url)
        soup = BeautifulSoup(res.text, "html.parser")
        
        # Extraer seccion "Goals per 90 minutes"
        goals_per_90_section = None
        for section in soup.find_all('section', class_='widget_text'):
            h3 = section.find('h3', class_='widget-title')
            if h3 and "Goals per 90 minutes" in h3.get_text():
                goals_per_90_section = section
                break
        
        players_goals_per_90 = []
        if goals_per_90_section:
            players_divs = goals_per_90_section.find_all('div', class_="w100 mb10 pr cf")
            for player_div in players_divs:
                name_span = player_div.find('span', class_="pa")
                if name_span:
                    text = name_span.get_text(strip=True)
                    match = re.match(r'(.+?)\s+([0-9.]+)$', text)
                    if match:
                        name = match.group(1)
                        value = float(match.group(2))
                        players_goals_per_90.append({"jugador": name, "goles_por_90": value})
        
        datos_goles_90 = {
            "liga": "LaLiga 2025/26",
            "goles_por_90": players_goals_per_90
        }
        
        with open("laliga_2025_26_goles_por_90.json", "w", encoding="utf-8") as f:
            json.dump(datos_goles_90, f, ensure_ascii=False, indent=2)
        
        print(f"[OK] Goles por 90 min: {len(players_goals_per_90)} jugadores guardados")
        
    except Exception as e:
        print(f"[ERROR] footyGoalsPer90: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
