import json
import os
import sys
from datetime import datetime, timezone, timedelta
import requests

def fetch_la_liga_data():
    """Fetch La Liga data from the API"""
    url = "https://fixturedownload.com/feed/json/la-liga-2025" 
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

def process_matches(matches):
    """Process raw matches data into our format"""
    if not matches or not isinstance(matches, list):
        print("Error: No se recibieron datos de partidos válidos")
        return {}
        
    processed = {}
    
    for match in matches:
        try:
            # Extraer fecha y hora del partido desde DateUtc si está disponible
            match_date = ''
            match_time = '00:00'
            
            if 'DateUtc' in match and match['DateUtc']:
                try:
                    # Parsear fecha UTC
                    dt_utc = datetime.strptime(match['DateUtc'], '%Y-%m-%d %H:%M:%S%z')
                    
                    # Convertir a hora de Canarias (WEST/UTC+1)
                    canary_tz = timezone(timedelta(hours=1))  # UTC+1 para Canarias
                    dt_canary = dt_utc.astimezone(canary_tz)
                    
                    match_date = dt_canary.strftime('%Y-%m-%d')
                    match_time = dt_canary.strftime('%H:%M')
                except (ValueError, TypeError) as e:
                    print(f"Error parsing date: {e}")
            
            # Resto del código...
            home_score = None
            away_score = None
            status = 'Pendiente'
            
            # Verificar si hay puntuaciones disponibles en la respuesta de la API
            if all(key in match for key in ['HomeTeamScore', 'AwayTeamScore']):
                try:
                    home_score = int(match['HomeTeamScore']) if match['HomeTeamScore'] is not None else None
                    away_score = int(match['AwayTeamScore']) if match['AwayTeamScore'] is not None else None
                    
                    # Si tenemos puntuaciones, el partido ha terminado
                    if home_score is not None and away_score is not None:
                        status = 'Finalizado'
                        
                except (ValueError, TypeError) as e:
                    print(f"Error parsing scores: {e}")
            
            # Obtener número de jornada, por defecto 0 si no está disponible
            round_num = str(match.get('RoundNumber', '0'))
            
            # Crear objeto de partido con todos los datos disponibles
            match_obj = {
                'home_team': match.get('HomeTeam', 'Equipo Local'),
                'away_team': match.get('AwayTeam', 'Equipo Visitante'),
                'home_score': home_score,
                'away_score': away_score,
                'round': int(round_num),
                'location': match.get('Location', 'Estadio no especificado'),
                'date': match_date,
                'time': match_time,
                'match_id': match.get('MatchNumber', ''),
                'status': status
            }
            
            # Añadir al diccionario procesado por jornada
            if round_num not in processed:
                processed[round_num] = []
            processed[round_num].append(match_obj)
            
        except Exception as e:
            print(f"Error procesando partido {match.get('MatchNumber', 'desconocido')}: {e}")
            continue
    
    return processed

def save_to_json(data, filename='laliga_2025_26_calendario.json'):
    """Guardar datos en archivo JSON"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_from_json(filename='laliga_2025_26_calendario.json'):
    """Cargar datos desde archivo JSON"""
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def should_refresh_data():
    """Verificar si se deben actualizar los datos (una vez al día)"""
    try:
        if not os.path.exists('laliga_2025_26_calendario.json'):
            return True
            
        file_time = os.path.getmtime('laliga_2025_26_calendario.json')
        last_updated = datetime.fromtimestamp(file_time)
        now = datetime.now()
        
        # Actualizar si han pasado más de 24 horas
        return (now - last_updated).total_seconds() > 86400  # 24 horas en segundos
    except Exception as e:
        print(f"Error al verificar la hora del archivo: {e}")
        return True

def update_calendar(force_refresh=False):
    """Actualizar el calendario con los últimos datos"""
    refresh_needed = force_refresh or should_refresh_data()
    
    # Intentar cargar desde archivo si no es necesario actualizar
    if not refresh_needed:
        try:
            data = load_from_json()
            if data:  # Solo devolver datos en caché si existen y no están vacíos
                return {
                    "data": data,
                    "last_updated": os.path.getmtime('laliga_2025_26_calendario.json'),
                    "refresh_available": False
                }
        except (json.JSONDecodeError, FileNotFoundError, ValueError) as e:
            print(f"Error cargando archivo local: {e}")
            refresh_needed = True
    
    # Si llegamos aquí, necesitamos obtener datos frescos
    print("Obteniendo datos actualizados de la API...")
    data = fetch_la_liga_data()
    if data:
        processed_data = process_matches(data)
        save_to_json(processed_data)
        return {
            "data": processed_data,
            "last_updated": os.path.getmtime('laliga_2025_26_calendario.json'),
            "refresh_available": True
        }
    
    return {"error": "No se pudieron cargar los datos de la API"}

def get_teams():
    """Obtener lista de todos los equipos"""
    data = load_from_json()
    if not data:
        return {'error': 'No hay datos disponibles'}
        
    teams = set()
    for round_matches in data.values():
        for match in round_matches:
            teams.add(match['home_team'])
            teams.add(match['away_team'])
            
    return sorted(list(teams))

if __name__ == "__main__":
    """Punto de entrada cuando se ejecuta el script directamente"""
    try:
        result = update_calendar(force_refresh=True)
        if 'error' in result:
            print(f"Error: {result['error']}")
            sys.exit(1)
        print("laliga_2025_26_calendario.json actualizado exitosamente")
        sys.exit(0)
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        sys.exit(1)
