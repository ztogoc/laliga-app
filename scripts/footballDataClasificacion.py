import requests
import json

API_KEY = "9d879f14c4d04cdfb4c35a895f73c30c"
headers = {"X-Auth-Token": API_KEY}

url = "https://api.football-data.org/v4/competitions/PD/standings?season=2025"

response = requests.get(url, headers=headers)
response.raise_for_status()
data = response.json()

# Hay 3 tipos de standings normalmente: Total, Home, Away
for standing in data["standings"]:
    tipo = standing["type"].lower()  # total, home, away
    tabla = []
    for equipo in standing["table"]:
        tabla.append({
            "posicion": equipo["position"],
            "equipo": equipo["team"]["name"],
            "puntos": equipo["points"],
            "partidos_jugados": equipo["playedGames"],
            "ganados": equipo["won"],
            "empatados": equipo["draw"],
            "perdidos": equipo["lost"],
            "goles_a_favor": equipo["goalsFor"],
            "goles_en_contra": equipo["goalsAgainst"]
        })

    filename = f"laliga_2025_26_clasificacion_{tipo}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(tabla, f, indent=2, ensure_ascii=False)
    print(f"Archivo guardado: {filename}")
