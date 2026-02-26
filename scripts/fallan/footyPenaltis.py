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
        
        penalties_section = None
        for section in soup.find_all('section', class_='widget_text'):
            h3 = section.find('h3', class_='widget-title')
            if h3 and "Penalties Scored" in h3.get_text():
                penalties_section = section
                break
        
        penalties = []
        if penalties_section:
            jugadores_divs = penalties_section.find_all('div', class_="w100 mb10 pr cf")
            for jugador_div in jugadores_divs:
                nombre_span = jugador_div.find('span', class_="pa")
                if nombre_span:
                    texto = nombre_span.get_text(strip=True)
                    match = re.match(r'(.+?)\s+(\d+)$', texto)
                    if match:
                        nombre = match.group(1)
                        penaltis_marcados = int(match.group(2))
                        penalties.append({"jugador": nombre, "penaltis_marcados": penaltis_marcados})
        
        datos_penaltis = {
            "liga": "LaLiga 2025/26",
            "penaltis_marcados_por_jugador": penalties
        }
        
        with open("laliga_2025_26_penaltis.json", "w", encoding="utf-8") as f:
            json.dump(datos_penaltis, f, ensure_ascii=False, indent=2)
        
        print(f"[OK] Penaltis: {len(penalties)} jugadores guardados")
        
    except Exception as e:
        print(f"[ERROR] footyPenaltis: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
