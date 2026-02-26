import requests
from bs4 import BeautifulSoup
import json

url = "https://www.jornadaperfecta.com/lesionados/"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
    "Referer": "https://www.google.com/"
}

response = requests.get(url, headers=headers)
response.raise_for_status()

soup = BeautifulSoup(response.content, "html.parser")

equipos = soup.select("div.lesionados")

result = []

for equipo_div in equipos:
    equipo_nombre_tag = equipo_div.select_one("div.lesionados-equipo-nombre a")
    equipo_nombre = equipo_nombre_tag.text.strip() if equipo_nombre_tag else None
    equipo_url = equipo_nombre_tag['href'] if equipo_nombre_tag else None

    escudo_img = equipo_div.select_one("div.lesionados-equipo-escudo img")
    escudo_url = escudo_img['src'] if escudo_img else None
    escudo_title = escudo_img['title'] if escudo_img else None

    jugadores = []
    jugadores_divs = equipo_div.select("div.lesionados-jugador")
    for jugador_div in jugadores_divs:
        # Verificar si el jugador está disponible o es un mensaje de "Ningún jugador lesionado o duda..."
        sanos_frase = jugador_div.select_one("div.lesionados-jugador-sanos-frase")
        disponible_tag = jugador_div.select_one("span.estado-disponible")
        if sanos_frase or disponible_tag:
            continue

        nombre_tag = jugador_div.select_one("div.lesionados-jugador-nombre a")
        nombre_jugador = nombre_tag.text.strip() if nombre_tag else None
        url_jugador = nombre_tag['href'] if nombre_tag else None

        motivo_tag = jugador_div.select_one("div.lesionados-jugador-motivo")
        motivo = motivo_tag.text.strip() if motivo_tag else None

        vuelta_estimada_parts = jugador_div.select("span.bold")
        vuelta_estimada = " ".join([s.text.strip() for s in vuelta_estimada_parts]) if vuelta_estimada_parts else None

        posicion_tag = jugador_div.select_one("div.jugador-posicion")
        posicion = posicion_tag.text.strip() if posicion_tag else None

        noticia_tag = jugador_div.select_one("a i.gg-time")
        url_noticia = noticia_tag.parent['href'] if noticia_tag and noticia_tag.parent.has_attr('href') else None

        jugadores.append({
            "nombre": nombre_jugador,
            "url": url_jugador,
            "motivo_lesion": motivo,
            "vuelta_estimada": vuelta_estimada,
            "posicion": posicion,
            "url_noticia": url_noticia
        })
    
    result.append({
        "equipo_nombre": equipo_nombre,
        "equipo_url": equipo_url,
        "escudo_url": escudo_url,
        "escudo_title": escudo_title,
        "jugadores": jugadores
    })

# Guardar JSON
with open("laliga_2025_26_lesionados_laliga.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("JSON de lesionados guardado en laliga_2025_26_lesionados_laliga.json")
