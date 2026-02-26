#!/usr/bin/env python3
"""
Script para actualizar todos los datos de la aplicación laliga-app.
Ejecuta los scripts de Python en el orden correcto para actualizar los datos.
"""

import os
import sys
import subprocess
import shutil
from datetime import datetime

def log_message(message, level="INFO"):
    """Muestra un mensaje de log con marca de tiempo y nivel"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level.upper()}] {message}")

def run_script(script_name):
    """Ejecuta un script de Python y maneja los errores."""
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    log_message(f"Ejecutando {script_name}...")
    
    try:
        # Usar el Python del entorno virtual si está activo
        python_exec = sys.executable if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix) else 'python'
        
        result = subprocess.run(
            [python_exec, script_name],
            cwd=os.path.dirname(script_path),
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            log_message(f"{script_name} completado exitosamente")
            return True
        else:
            log_message(f"Error en {script_name}: {result.stderr}", "ERROR")
            return False
    except subprocess.CalledProcessError as e:
        log_message(f"Error al ejecutar {script_name}: Código de salida: {e.returncode}, Error: {e.stderr}", "ERROR")
        return False
    except FileNotFoundError:
        log_message(f"Error: No se encontró el script {script_name}", "ERROR")
        return False

def main():
    """Función principal que orquesta la actualización de todos los scripts"""
    log_message("=== INICIO DE ACTUALIZACIÓN ===")
    
    # Obtener rutas de directorios
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(os.path.dirname(script_dir), 'data')
    
    # Asegurarse de que el directorio de datos existe
    os.makedirs(data_dir, exist_ok=True)
    
    # Lista de scripts a ejecutar
    # Nota: Scripts FootyStats comentados porque fallan con 403 desde GitHub Actions
    scripts = [
        'fixtureCalendario.py',
        'footballDataClasificacion.py',
        'footballDataEventos.py',
        'footyGoleadores.py',
        'JornadaPerfectaLesionados.py',
        'hipervinculos.py',
        'extract_ultimos5.py'
    ]
    
    # Ejecutar cada script
    for script in scripts:
        script_path = os.path.join(script_dir, script)
        if os.path.exists(script_path):
            log_message(f"Ejecutando {script}...")
            try:
                result = subprocess.run(['python', script], cwd=script_dir, capture_output=True, text=True)
                if result.returncode == 0:
                    log_message(f"{script} ejecutado exitosamente")
                else:
                    log_message(f"Error en {script}: {result.stderr}", "ERROR")
            except Exception as e:
                log_message(f"Error al ejecutar {script}: {str(e)}", "ERROR")
        else:
            log_message(f"Advertencia: No se encontró el script {script}", "WARNING")
    
    # Mover todos los archivos JSON al directorio de datos
    log_message("\nIniciando copia de archivos JSON...")
    log_message(f"Directorio de origen: {script_dir}")
    log_message(f"Directorio destino: {data_dir}")
    
    # Asegurarse de que el directorio de destino existe
    os.makedirs(data_dir, exist_ok=True)
    
    # Obtener todos los archivos .json en el directorio de scripts
    try:
        all_files = os.listdir(script_dir)
        json_files = [f for f in all_files if f.lower().endswith('.json')]
        log_message(f"\nArchivos encontrados en el directorio: {all_files}")
        log_message(f"Archivos JSON encontrados: {json_files}")
        
        if not json_files:
            log_message("No se encontraron archivos JSON para mover", "WARNING")
            return
    except Exception as e:
        log_message(f"Error al listar archivos en el directorio: {str(e)}", "ERROR")
        return
        
    moved_count = 0
    for json_file in json_files:
        src = os.path.join(script_dir, json_file)
        dst = os.path.join(data_dir, json_file)
        
        log_message(f"\nProcesando: {json_file}")
        log_message(f"Origen: {src}")
        log_message(f"Destino: {dst}")
        
        try:
            if not os.path.exists(src):
                log_message(f"Error: El archivo de origen no existe: {src}", "ERROR")
                continue
                
            # Usar copy2 para preservar los metadatos
            shutil.copy2(src, dst)
            
            # Verificar que el archivo se copió correctamente
            if os.path.exists(dst):
                moved_count += 1
                log_message(f"✅ Copiado exitosamente: {json_file}")
            else:
                log_message(f"❌ Error: No se pudo verificar la copia de {json_file}", "ERROR")
                
        except Exception as e:
            log_message(f"❌ Error al copiar {json_file}: {str(e)}", "ERROR")
    
    # Eliminar archivos JSON del directorio de scripts
    if moved_count > 0:
        log_message("\nEliminando archivos JSON del directorio de scripts...")
        deleted_count = 0
        for json_file in json_files:
            src = os.path.join(script_dir, json_file)
            try:
                if os.path.exists(src):
                    os.remove(src)
                    if not os.path.exists(src):
                        deleted_count += 1
                        log_message(f"✅ Eliminado: {src}")
                    else:
                        log_message(f"❌ No se pudo eliminar: {src}", "ERROR")
            except Exception as e:
                log_message(f"❌ Error al eliminar {src}: {str(e)}", "ERROR")
        
        log_message(f"Se eliminaron {deleted_count} de {moved_count} archivos JSON del directorio de scripts")
    
    # Resumen final
    if moved_count == len(json_files):
        log_message(f"\n✅ Actualización completada con éxito. Se copiaron {moved_count} archivos JSON", "SUCCESS")
    else:
        log_message(f"\n⚠️  Actualización completada con {len(json_files) - moved_count} errores. Se copiaron {moved_count} de {len(json_files)} archivos", "WARNING")

if __name__ == "__main__":
    main()
    sys.exit(0)