def main():
    url = "https://footystats.org/spain/la-liga"
    
    try:
        res = fetch_with_retry(url)
        soup = BeautifulSoup(res.text, "html.parser")
        
        # Extraer sección "Top Scorers"
        top_scorers_section = soup.find('section', class_="widget_text")
        if not top_scorers_section:
            raise Exception("No se encontró la sección de Top Scorers")
        
        # Encontrar todos los elementos de jugadores
        player_elements = top_scorers_section.find_all('a', class_="goal-row")
        if not player_elements:
            raise Exception("No se encontraron jugadores en la sección de Top Scorers")
        
        top_scorers = []
        
        for player_elem in player_elements:
            try:
                # Extraer nombre del jugador
                name_span = player_elem.find('span', class_="pa")
                if not name_span:
                    continue
                
                # Limpiar el nombre (eliminar espacios extras, saltos de línea, etc.)
                player_name = ' '.join(name_span.get_text(strip=True).split())
                
                # Extraer goles (está al final del texto después del último espacio)
                goals = 0
                if '&​nbsp;' in player_name:
                    player_name, goals_str = player_name.rsplit('&​nbsp;', 1)
                    goals = int(goals_str.strip())
                else:
                    # Alternativa: buscar el número al final del texto
                    import re
                    match = re.search(r'(\d+)$', player_name)
                    if match:
                        goals = int(match.group(1))
                        player_name = player_name[:match.start()].strip()
                
                # Extraer nacionalidad (si está disponible)
                nationality = "Desconocida"
                flag_span = name_span.find('span', class_=lambda x: x and 'flag-' in x)
                if flag_span:
                    flag_class = [c for c in flag_span.get('class', []) if c.startswith('flag-')]
                    if flag_class:
                        nationality = flag_class[0].replace('flag-', '').upper()
                
                # Extraer enlace al perfil
                profile_url = player_elem.get('href', '')
                if profile_url and not profile_url.startswith('http'):
                    profile_url = f"https://footystats.org{profile_url}"
                
                # Extraer porcentaje (del ancho del estilo)
                percentage = 0
                style = player_elem.get('style', '')
                if 'width:' in style:
                    try:
                        percentage = float(style.split('width:')[1].split('%')[0].strip())
                    except (IndexError, ValueError):
                        pass
                
                top_scorers.append({
                    'posicion': len(top_scorers) + 1,
                    'jugador': player_name,
                    'goles': goals,
                    'porcentaje': percentage,
                    'nacionalidad': nationality,
                    'perfil_url': profile_url,
                    'fecha_actualizacion': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
                
            except Exception as e:
                print(f"Error procesando jugador: {str(e)}")
                continue
        
        # Ordenar por goles (por si acaso no vienen ordenados)
        top_scorers.sort(key=lambda x: x['goles'], reverse=True)
        
        # Actualizar posiciones después de ordenar
        for i, scorer in enumerate(top_scorers, 1):
            scorer['posicion'] = i
        
        # Crear directorio de datos si no existe
        os.makedirs('data', exist_ok=True)
        
        # Guardar en JSON
        output_file = 'data/laliga_2025_26_Goleadores.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'temporada': '2025/26',
                'liga': 'LaLiga',
                'fecha_actualizacion': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'maximos_goleadores': top_scorers
            }, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Datos guardados en {output_file}")
        print(f"📊 Total de jugadores: {len(top_scorers)}")
        print(f"⚽ Máximo goleador: {top_scorers[0]['jugador']} ({top_scorers[0]['goles']} goles)")
            
    except Exception as e:
        print(f"\n❌ Error en el proceso principal: {str(e)}")
        import traceback
        traceback.print_exc()