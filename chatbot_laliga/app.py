from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from chatbot import LaLigaChatbot

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Inicializar el chatbot
chatbot = LaLigaChatbot()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    # Obtener respuesta del chatbot
    response = chatbot.get_response(user_message)
    
    return jsonify({
        'response': response
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
