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

def fetch_with_retry(url, max_retries=3, delay_range=(5, 10)):
    scraper = create_scraper()
    
    # Headers exactos del navegador Brave
    extra_headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not:A-Brand";v="99", "Brave";v="145", "Chromium";v="145"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Priority': 'u=0, i',
        'DNT': '1'
    }
    
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                delay = random.uniform(delay_range[0], delay_range[1])
                print(f"Esperando {delay:.1f}s antes del reintento {attempt + 1}...")
                time.sleep(delay)
            
            print(f"Intento {attempt + 1}/{max_retries}: {url}")
            res = scraper.get(url, headers=extra_headers, timeout=30)
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
        
        top_assists_section = None
        for section in soup.find_all('section', class_='widget_text'):
            h3 = section.find('h3', class_='widget-title')
            if h3 and "Top Assists" in h3.get_text():
                top_assists_section = section
                break
        
        top_assists = []
        if top_assists_section:
            jugadores_divs = top_assists_section.find_all('div', class_="w100 mb10 pr cf")
            for jugador_div in jugadores_divs:
                nombre_span = jugador_div.find('span', class_="pa")
                if nombre_span:
                    texto = nombre_span.get_text(strip=True)
                    match = re.match(r'(.+?)\s+(\d+)$', texto)
                    if match:
                        nombre = match.group(1)
                        asistencias = int(match.group(2))
                        top_assists.append({"jugador": nombre, "asistencias": asistencias})
        
        datos_asistentes = {
            "liga": "LaLiga 2025/26",
            "maximos_asistentes": top_assists
        }
        
        with open("laliga_2025_26_asistentes.json", "w", encoding="utf-8") as f:
            json.dump(datos_asistentes, f, ensure_ascii=False, indent=2)
        
        print(f"[OK] Asistentes: {len(top_assists)} jugadores guardados")
        
    except Exception as e:
        print(f"[ERROR] footyAsis: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
