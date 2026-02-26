from bs4 import BeautifulSoup
import requests
from datetime import datetime, timedelta
import re
import json
import os

# Lista de equipos de La Liga primera división 2025-26 (formato URL)
equipos_la_liga = [
    "alaves", "athletic", "atletico", "barcelona", "betis", "celta",
    "deportivo", "espanyol", "getafe", "girona", "las-palmas", "leganes",
    "mallorca", "osasuna", "rayo-vallecano", "real-madrid", "real-sociedad",
    "sevilla", "valencia", "valladolid", "villarreal"
]

# Mapeo de nombres de equipos (formato URL -> formato JSON)
MAPEO_EQUIPOS = {
    "alaves": "Deportivo Alavés",
    "athletic": "Athletic Club",
    "atletico": "Atlético de Madrid",
    "barcelona": "FC Barcelona",
    "betis": "Real Betis",
    "celta": "RC Celta",
    "deportivo": "RC Deportivo",
    "espanyol": "RCD Espanyol de Barcelona",
    "getafe": "Getafe CF",
    "girona": "Girona FC",
    "las-palmas": "UD Las Palmas",
    "leganes": "CD Leganés",
    "mallorca": "RCD Mallorca",
    "osasuna": "CA Osasuna",
    "rayo-vallecano": "Rayo Vallecano",
    "real-madrid": "Real Madrid",
    "real-sociedad": "Real Sociedad",
    "sevilla": "Sevilla FC",
    "valencia": "Valencia CF",
    "valladolid": "Real Valladolid",
    "villarreal": "Villarreal CF"
}

# Ruta del archivo JSON
JSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'laliga_2025_26_ultimos5.json')

url = "https://www.jornadaperfecta.com/blog/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

def cargar_json():
    """Carga el archivo JSON existente"""
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] No se pudo cargar el JSON existente: {e}")
        return {}

def guardar_json(data):
    """Guarda los datos en el archivo JSON"""
    try:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[OK] Datos guardados en: {JSON_PATH}")
        return True
    except Exception as e:
        print(f"[ERROR] Error al guardar JSON: {e}")
        return False

def obtener_info_articulo(url_articulo):
    """Obtiene el título y fecha real de un artículo individual"""
    try:
        response = requests.get(url_articulo, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extraer título desde h1.entry-title
        titulo = ''
        h1 = soup.find('h1', class_='entry-title')
        if h1:
            titulo = h1.get_text(strip=True)
        
        # Extraer fecha desde time.entry-date
        fecha = 'desconocida'
        time_elem = soup.find('time', class_='entry-date')
        if time_elem:
            # Obtener el atributo datetime
            datetime_attr = time_elem.get('datetime', '')
            if datetime_attr:
                try:
                    # Parsear formato ISO: 2026-02-18T09:10:57+01:00
                    fecha_dt = datetime.fromisoformat(datetime_attr.replace('+01:00', '+0100').replace('+02:00', '+0200'))
                    fecha = fecha_dt.strftime('%Y-%m-%d')
                except ValueError:
                    # Si falla, usar el texto visible
                    fecha_texto = time_elem.get_text(strip=True)
                    # Parsear formato español: 18/02/2026
                    try:
                        dia, mes, año = map(int, fecha_texto.split('/'))
                        fecha = f"{año:04d}-{mes:02d}-{dia:02d}"
                    except ValueError:
                        fecha = 'desconocida'
            else:
                # Intentar con el texto visible
                fecha_texto = time_elem.get_text(strip=True)
                try:
                    dia, mes, año = map(int, fecha_texto.split('/'))
                    fecha = f"{año:04d}-{mes:02d}-{dia:02d}"
                except ValueError:
                    fecha = 'desconocida'
        
        return {
            'titulo': titulo,
            'fecha': fecha
        }
    except Exception as e:
        print(f"    [WARN] Error obteniendo info de {url_articulo}: {e}")
        return {'titulo': '', 'fecha': 'desconocida'}

def obtener_noticias():
    """Obtiene las noticias de la web con información detallada de cada artículo"""
    try:
        print("[INFO] Obteniendo página principal...")
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Fecha límite (último mes)
        fecha_limite = datetime.now() - timedelta(days=30)

        links_encontrados = []

        # Buscar todos los enlaces
        links = soup.find_all('a', href=True)
        print(f"[INFO] {len(links)} enlaces encontrados en la página")

        for link in links:
            href = link['href'].lower()
            texto = link.get_text(strip=True)

            # Verificar si el link pertenece a algún equipo de La Liga
            for equipo in equipos_la_liga:
                if equipo in href or equipo in texto.lower():
                    # Verificar que sea un artículo válido
                    if '/blog/' not in href:
                        continue
                    
                    # Extraer fecha del URL si está disponible (patrón: /AAAA/MM/DD/)
                    fecha_match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', href)
                    fecha_url = None
                    
                    if fecha_match:
                        try:
                            año, mes, dia = int(fecha_match.group(1)), int(fecha_match.group(2)), int(fecha_match.group(3))
                            fecha_url = datetime(año, mes, dia)
                            if fecha_url < fecha_limite:
                                continue  # Saltar artículos antiguos
                        except ValueError:
                            pass
                    
                    # Asegurar URL completa
                    url_completa = href if href.startswith('http') else f"https://www.jornadaperfecta.com{href if href.startswith('/') else '/' + href}"
                    
                    links_encontrados.append({
                        'url': url_completa,
                        'equipo_key': equipo,
                        'equipo': MAPEO_EQUIPOS.get(equipo, equipo),
                        'fecha_url': fecha_url
                    })
                    break

        print(f"[INFO] {len(links_encontrados)} enlaces de equipos encontrados")
        
        # Eliminar duplicados por URL
        links_unicos = {}
        for link in links_encontrados:
            if link['url'] not in links_unicos:
                links_unicos[link['url']] = link
        
        links_unicos_list = list(links_unicos.values())
        print(f"[INFO] {len(links_unicos_list)} enlaces únicos")
        
        # Obtener información detallada de cada artículo
        noticias_completas = []
        for i, link in enumerate(links_unicos_list, 1):
            print(f"  [{i}/{len(links_unicos_list)}] Scraping: {link['url'][:60]}...")
            
            info = obtener_info_articulo(link['url'])
            
            # Solo incluir si se obtuvo un título válido
            if info['titulo']:
                # Filtrar noticias con "Supercuota" o "Promoción"
                if 'supercuota' in info['titulo'].lower() or 'promocion' in info['titulo'].lower():
                    print(f"      [SKIP] Filtrada: {info['titulo'][:50]}...")
                    continue
                
                # Verificar que la fecha esté dentro del rango
                if info['fecha'] != 'desconocida':
                    try:
                        año, mes, dia = map(int, info['fecha'].split('-'))
                        fecha_articulo = datetime(año, mes, dia)
                        if fecha_articulo < fecha_limite:
                            print(f"      [SKIP] Artículo antiguo, saltando")
                            continue
                    except ValueError:
                        pass
                
                noticias_completas.append({
                    'url': link['url'],
                    'equipo_key': link['equipo_key'],
                    'equipo': link['equipo'],
                    'fecha': info['fecha'],
                    'titulo': info['titulo']
                })
                print(f"      [OK] {info['titulo'][:50]}...")
            else:
                print(f"      [WARN] No se pudo obtener título")
        
        return noticias_completas

    except requests.RequestException as e:
        print(f"Error al obtener la página: {e}")
        return []
    except Exception as e:
        print(f"Error: {e}")
        return []

def estructurar_por_equipo(links):
    """Agrupa los links por equipo"""
    equipos_data = {}
    
    for link in links:
        equipo_nombre = link['equipo']
        
        if equipo_nombre not in equipos_data:
            equipos_data[equipo_nombre] = []
        
        equipos_data[equipo_nombre].append({
            'url': link['url'],
            'fecha': link['fecha'],
            'titulo': link['titulo']
        })
    
    return equipos_data

def main():
    print("[INFO] Cargando datos existentes...")
    data_json = cargar_json()
    
    print("[INFO] Obteniendo noticias de jornadaperfecta.com...")
    links = obtener_noticias()
    
    if not links:
        print("[WARN] No se encontraron noticias")
        return
    
    print(f"[INFO] {len(links)} noticias encontradas")
    
    # Estructurar por equipo
    links_por_equipo = estructurar_por_equipo(links)
    
    print(f"[INFO] {len(links_por_equipo)} equipos con noticias")
    
    # Agregar links a cada equipo en el JSON
    noticias_agregadas = 0
    for equipo_nombre, noticias in links_por_equipo.items():
        if equipo_nombre in data_json:
            # Agregar campo 'news_links' al equipo
            data_json[equipo_nombre]['news_links'] = noticias[:10]  # Máximo 10 noticias por equipo
            noticias_agregadas += len(noticias[:10])
            print(f"  [OK] {equipo_nombre}: {len(noticias)} noticias")
        else:
            print(f"  [WARN] Equipo no encontrado en JSON: {equipo_nombre}")
    
    # Guardar resultado
    if guardar_json(data_json):
        print(f"\n[SUMMARY]")
        print(f"   - Total noticias procesadas: {len(links)}")
        print(f"   - Noticias agregadas al JSON: {noticias_agregadas}")
        print(f"   - Equipos actualizados: {len(links_por_equipo)}")

if __name__ == '__main__':
    main()