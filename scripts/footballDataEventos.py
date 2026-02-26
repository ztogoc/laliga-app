import requests
import json
import time
import sys

API_KEY = "9d879f14c4d04cdfb4c35a895f73c30c"
HEADERS = {"X-Auth-Token": API_KEY}
COMPETICION = "PD"  # LaLiga (Primera División España)


def obtener_info_competicion():
    url = f"https://api.football-data.org/v4/competitions/{COMPETICION}"
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 429:
        print("⚠️ Límite de peticiones alcanzado, esperando 60 segundos...")
        time.sleep(60)
        resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    data = resp.json()

    competition = {
        "id": data.get("id"),
        "name": data.get("name"),
        "code": data.get("code"),
    }

    season = {}
    if data.get("currentSeason"):
        season = {
            "id": data["currentSeason"].get("id"),
            "startDate": data["currentSeason"].get("startDate"),
            "endDate": data["currentSeason"].get("endDate"),
            "currentMatchday": data["currentSeason"].get("currentMatchday"),
        }

    return competition, season


def obtener_datos_jornada(jornada: int, competition: dict, season: dict):
    url = f"https://api.football-data.org/v4/competitions/{COMPETICION}/matches?matchday={jornada}"
    resp = requests.get(url, headers=HEADERS)

    if resp.status_code == 429:
        print("⚠️ Límite de peticiones alcanzado, esperando 60 segundos...")
        time.sleep(60)
        resp = requests.get(url, headers=HEADERS)

    resp.raise_for_status()
    data = resp.json()

    result_set = data.get("resultSet", {})
    matches = data.get("matches", [])

    resumen = {
        "competition": competition,
        "season": season,
        "jornada": jornada,
        "metadata": result_set,
        "partidos": []
    }

    for m in matches:
        partido = {
            "partido_id": m.get("id"),
            "fecha": m.get("utcDate"),
            "estado": m.get("status"),
            "jornada": m.get("matchday"),
            "fase": m.get("stage"),
            "grupo": m.get("group"),
            "ultima_actualizacion": m.get("lastUpdated"),
            "equipo_local": {
                "id": m.get("homeTeam", {}).get("id"),
                "name": m.get("homeTeam", {}).get("name"),
                "shortName": m.get("homeTeam", {}).get("shortName"),
                "tla": m.get("homeTeam", {}).get("tla")
            },
            "equipo_visitante": {
                "id": m.get("awayTeam", {}).get("id"),
                "name": m.get("awayTeam", {}).get("name"),
                "shortName": m.get("awayTeam", {}).get("shortName"),
                "tla": m.get("awayTeam", {}).get("tla")
            },
            "marcador": {
                "ganador": m.get("score", {}).get("winner"),
                "duracion": m.get("score", {}).get("duration"),
                "descanso": m.get("score", {}).get("halfTime"),
                "final": m.get("score", {}).get("fullTime"),
                "prorroga": m.get("score", {}).get("extraTime"),
                "penales": m.get("score", {}).get("penalties")
            }
        }
        resumen["partidos"].append(partido)

    return resumen


def guardar_json(resumen: dict, jornada: int):
    filename = f"laliga_2025_26_eventos_{jornada}_resumen.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(resumen, f, ensure_ascii=False, indent=2)
    print(f"✅ Jornada {jornada} guardada en {filename}")


def main():
    try:
        jornada_inicio = int(input("👉 Jornada inicial: "))
        jornada_fin = int(input("👉 Jornada final: "))

        competition, season = obtener_info_competicion()

        for jornada in range(jornada_inicio, jornada_fin + 1):
            print(f"\n📥 Descargando datos de la jornada {jornada}...")
            resumen = obtener_datos_jornada(jornada, competition, season)
            guardar_json(resumen, jornada)
            time.sleep(3)  # para no llegar al límite de rate
        print("\n🎉 Descarga completada.")
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
