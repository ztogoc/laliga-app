import os
import json
import numpy as np
from typing import Dict, List, Any, Optional
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re

# Descargar recursos de NLTK
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

class LaLigaChatbot:
    def __init__(self, data_dir: str = None):
        """Inicializa el chatbot con los datos de LaLiga."""
        if data_dir is None:
            # Ruta relativa a los datos de LaLiga
            self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'laliga-app', 'data')
        else:
            self.data_dir = data_dir
        
        # Cargar datos
        self.data = self._load_data()
        
        # Inicializar el modelo de embeddings
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        
        # Preparar datos para búsqueda semántica
        self._prepare_search_data()
        
        # Inicializar stopwords en español
        self.stop_words = set(stopwords.words('spanish'))
    
    def _load_data(self) -> Dict[str, Any]:
        """Carga los datos de los archivos JSON."""
        data = {}
        try:
            # Cargar clasificación
            with open(os.path.join(self.data_dir, 'laliga_2025_26_clasificacion_total.json'), 'r', encoding='utf-8') as f:
                data['clasificacion'] = json.load(f)
                
            # Cargar goleadores
            with open(os.path.join(self.data_dir, 'laliga_2025_26_Goleadores.json'), 'r', encoding='utf-8') as f:
                data['goleadores'] = json.load(f)
                
            # Cargar asistentes
            with open(os.path.join(self.data_dir, 'laliga_2025_26_asistentes.json'), 'r', encoding='utf-8') as f:
                data['asistentes'] = json.load(f)
                
            # Cargar calendario
            with open(os.path.join(self.data_dir, 'laliga_2025_26_calendario.json'), 'r', encoding='utf-8') as f:
                data['calendario'] = json.load(f)
                
            # Cargar lesiones
            with open(os.path.join(self.data_dir, 'laliga_2025_26_lesionados_laliga.json'), 'r', encoding='utf-8') as f:
                data['lesionados'] = json.load(f)
                
        except Exception as e:
            print(f"Error al cargar los datos: {e}")
            
        return data
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocesa el texto para la búsqueda semántica."""
        # Convertir a minúsculas
        text = text.lower()
        # Eliminar caracteres especiales
        text = re.sub(r'[^\w\s]', '', text)
        # Tokenizar
        tokens = word_tokenize(text, language='spanish')
        # Eliminar stopwords
        tokens = [word for word in tokens if word not in self.stop_words]
        return ' '.join(tokens)
    
    def _prepare_search_data(self):
        """Prepara los datos para la búsqueda semántica."""
        self.search_data = []
        
        # Añadir clasificación
        for equipo in self.data.get('clasificacion', []):
            self.search_data.append({
                'text': f"{equipo['equipo']} está en la posición {equipo['posicion']} con {equipo['puntos']} puntos",
                'type': 'clasificacion',
                'data': equipo
            })
        
        # Añadir goleadores
        if 'goleadores' in self.data and 'maximos_goleadores' in self.data['goleadores']:
            for goleador in self.data['goleadores']['maximos_goleadores']:
                self.search_data.append({
                    'text': f"{goleador['jugador']} ha marcado {goleador['goles']} goles",
                    'type': 'goleador',
                    'data': goleador
                })
        
        # Añadir asistentes
        if 'asistentes' in self.data and 'maximos_asistentes' in self.data['asistentes']:
            for asistente in self.data['asistentes']['maximos_asistentes']:
                self.search_data.append({
                    'text': f"{asistente['jugador']} ha dado {asistente['asistencias']} asistencias",
                    'type': 'asistente',
                    'data': asistente
                })
        
        # Añadir próximos partidos
        if 'calendario' in self.data and 'partidos' in self.data['calendario']:
            for partido in self.data['calendario']['partidos'][:5]:  # Solo los próximos 5 partidos
                self.search_data.append({
                    'text': f"Próximo partido: {partido['local']} vs {partido['visitante']} el {partido['fecha']}",
                    'type': 'partido',
                    'data': partido
                })
        
        # Añadir lesionados
        if 'lesionados' in self.data and 'jugadores_lesionados' in self.data['lesionados']:
            for lesionado in self.data['lesionados']['jugadores_lesionados']:
                self.search_data.append({
                    'text': f"{lesionado['jugador']} del {lesionado['equipo']} está lesionado con {lesionado['lesion']}",
                    'type': 'lesionado',
                    'data': lesionado
                })
        
        # Preprocesar textos y generar embeddings
        self.search_texts = [self._preprocess_text(item['text']) for item in self.search_data]
        self.embeddings = self.model.encode(self.search_texts, convert_to_tensor=True)
    
    def _get_most_similar(self, query: str, top_k: int = 3) -> List[Dict]:
        """Encuentra los elementos más similares a la consulta."""
        # Preprocesar consulta
        query_processed = self._preprocess_text(query)
        
        # Generar embedding de la consulta
        query_embedding = self.model.encode([query_processed], convert_to_tensor=True)
        
        # Calcular similitud del coseno
        similarities = cosine_similarity(
            query_embedding.cpu().numpy(),
            self.embeddings.cpu().numpy()
        )[0]
        
        # Obtener índices de los más similares
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        # Devolver los resultados
        return [{
            'text': self.search_data[i]['text'],
            'type': self.search_data[i]['type'],
            'data': self.search_data[i]['data'],
            'score': float(similarities[i])
        } for i in top_indices if similarities[i] > 0.3]  # Umbral de similitud
    
    def get_response(self, query: str) -> str:
        """Genera una respuesta a la consulta del usuario."""
        # Buscar información relevante
        results = self._get_most_similar(query)
        
        if not results:
            return "Lo siento, no tengo información sobre eso. ¿Puedes reformular tu pregunta?"
        
        # Construir respuesta
        response = []
        
        for result in results:
            if result['type'] == 'clasificacion':
                equipo = result['data']
                response.append(
                    f"{equipo['equipo']} está en la posición {equipo['posicion']} "
                    f"con {equipo['puntos']} puntos, {equipo['ganados']} partidos ganados, "
                    f"{equipo['empatados']} empatados y {equipo['perdidos']} perdidos."
                )
            
            elif result['type'] == 'goleador':
                goleador = result['data']
                response.append(
                    f"{goleador['jugador']} es uno de los máximos goleadores "
                    f"con {goleador['goles']} goles."
                )
            
            elif result['type'] == 'asistente':
                asistente = result['data']
                response.append(
                    f"{asistente['jugador']} ha dado {asistente['asistencias']} asistencias."
                )
            
            elif result['type'] == 'partido':
                partido = result['data']
                response.append(
                    f"Próximo partido: {partido['local']} vs {partido['visitante']} "
                    f"el {partido['fecha']} a las {partido['hora']} en {partido['estadio']}."
                )
            
            elif result['type'] == 'lesionado':
                lesionado = result['data']
                response.append(
                    f"{lesionado['jugador']} del {lesionado['equipo']} "
                    f"está lesionado con {lesionado['lesion']}."
                )
        
        return "\n".join(response[:3])  # Devolver hasta 3 resultados

# Ejemplo de uso
if __name__ == "__main__":
    chatbot = LaLigaChatbot()
    while True:
        query = input("Tú: ")
        if query.lower() in ['salir', 'exit', 'q']:
            break
        response = chatbot.get_response(query)
        print(f"Bot: {response}")
