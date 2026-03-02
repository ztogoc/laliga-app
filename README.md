# 🏆 LaLiga 2025-26 - Sistema de Automatización de Datos

[![GitHub Actions](https://github.com/ztogoc/laliga-app/workflows/Actualizar%20Datos%20LaLiga/badge.svg)](https://github.com/ztogoc/laliga-app/actions)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://laliga-app.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Aplicación web moderna para el seguimiento en tiempo real de LaLiga 2025-26 con sistema de automatización completo para actualización de datos y despliegue continuo.

## 🌟 Características Principales

### 📊 **Dashboard Completo**
- **Clasificación en tiempo real** con posiciones Champions League, Europa League y descenso
- **Estadísticas detalladas** por equipo: goles marcados, recibidos, diferencia, rendimiento local/visitante
- **Calendario de partidos** con resultados actualizados automáticamente
- **Estadísticas individuales**: máximos goleadores, asistentes, y jugadores destacados

### 🤖 **Chatbot Inteligente**
- Asistente conversacional integrado para consultas sobre LaLiga
- Respuestas instantáneas sobre clasificación, resultados y estadísticas
- Interfaz moderna con animaciones fluidas

### 📱 **Diseño Responsivo**
- Interfaz optimizada para todos los dispositivos (mobile-first)
- Diseño moderno con animaciones CSS3 y transiciones suaves
- Esquema de colores inspirado en LaLiga (rojo #e6001f, azul #003366)

### ⚡ **Automatización Completa**
- Actualización automática de datos cada semana
- Despliegue continuo en Vercel
- Monitoreo de estado del sistema
- Notificaciones de cambios y actualizaciones

## 🏗️ Arquitectura del Proyecto

```
laliga-app/
├── 📁 data/                    # Datos JSON actualizados automáticamente
│   ├── laliga_2025_26_clasificacion_*.json
│   ├── laliga_2025_26_calendario.json
│   ├── laliga_2025_26_goleadores.json
│   └── laliga_2025_26_lesionados.json
├── 📁 scripts/                 # Scripts Python de scraping y procesamiento
│   ├── refrescar.py           # Orquestador principal
│   ├── footballDataClasificacion.py
│   ├── footyGoleadores.py
│   └── fixtureCalendario.py
├── 📁 src/                    # Código fuente frontend
│   ├── css/styles.css        # Estilos personalizados
│   └── js/                   # Módulos JavaScript
├── 📁 .github/workflows/     # Workflows de GitHub Actions
│   └── actualizar-datos.yml  # Automatización principal
└── 📄 index.html            # Aplicación principal
```

## 🔄 **Workflows de Automatización**

### 1. **Actualizar Datos LaLiga** (`.github/workflows/actualizar-datos.yml`)
**Ejecución:** Miércoles a las 09:00 UTC (o manual)

**Proceso:**
1. **Setup** - Checkout del repositorio y configuración de Python 3.11
2. **Dependencies** - Instalación automática de requirements.txt
3. **Data Collection** - Ejecución de `refrescar.py` que orquesta:
   - `footballDataClasificacion.py` - Clasificación completa
   - `footyGoleadores.py` - Máximos goleadores y asistentes
   - `fixtureCalendario.py` - Calendario y resultados
   - `JornadaPerfectaLesionados.py` - Estado de lesionados
4. **Commit & Push** - Si hay cambios, se confirman y sincronizan
5. **Deploy** - Despliegue automático en Vercel

**Secrets Requeridos:**
- `VERCEL_TOKEN` - Token de API de Vercel
- `VERCEL_ORG_ID` - ID de organización Vercel
- `VERCEL_PROJECT_ID` - ID del proyecto Vercel
- `GITHUB_TOKEN` - Automático (permisos de escritura)

### 2. **Monitor Sistema Estados** (`.github/workflows/monitor-estados.yml`)
**Ejecución:** Cada 12 horas (00:00 y 12:00 UTC) + manual

**Proceso:**
1. **Verificación APIs** - Comprueba Football-Data y FootyStats
2. **Verificación Scripts** - Valida archivos de datos JSON
3. **Verificación Sistema** - Revisa GitHub Actions, Deploy y conectividad
4. **Actualización Estado** - Genera JSON con estado completo
5. **Generación Logs** - Crea historial de monitoreo
6. **Deploy Automático** - Despliega en Vercel cada 12 horas
7. **Commit y Push** - Sincroniza cambios con el repositorio

**Características:**
- ✅ Monitoreo completo de APIs y archivos
- ✅ Logs detallados con timestamps
- ✅ Deploy automático redundante
- ✅ Verificación de espacio en disco y conectividad
- ✅ Reportes de estado en tiempo real

## 📈 **Datos y Estadísticas**

### **Fuentes de Datos:**
- **Football-Data.org** - API oficial para clasificación y resultados
- **FootyStats** - Estadísticas avanzadas y datos de jugadores
- **LaLiga Official** - Calendario oficial y estado de lesionados

### **Actualizaciones:**
- **Clasificación:** Cada lunes (post-jornada)
- **Resultados:** En tiempo real durante jornada
- **Estadísticas:** Actualización semanal completa
- **Lesionados:** Verificación diaria

## 🚀 **Despliegue y Configuración**

### **Variables de Entorno**
```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Python Environment
PYTHON_VERSION=3.11
```

### **Instalación Local**
```bash
# Clonar repositorio
git clone https://github.com/ztogoc/laliga-app.git
cd laliga-app

# Setup Python
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r scripts/requirements.txt

# Ejecutar actualización manual
cd scripts
python refrescar.py

# Servir localmente
cd ..
python -m http.server 8000
# o usar Vite para desarrollo
npm run dev
```

## 🎯 **Secciones de la Aplicación**

### **1. Dashboard Principal**
- Vista general con clasificación top 10
- Estadísticas destacadas de la jornada
- Acceso rápido a todas las secciones

### **2. Clasificación Completa**
- Tabla completa con todos los equipos
- Indicadores visuales de posiciones europeas/descenso
- Estadísticas detalladas por equipo

### **3. Estadísticas Avanzadas (Footy Stats)**
- **Goleadores:** Top 20 con goles, partidos, y promedio
- **Asistentes:** Ranking de asistencias y creatividad
- **Equipos:** Estadísticas ofensivas y defensivas
- **Rendimiento:** Métricas local/visitante

### **4. Calendario y Resultados**
- Fixture completo de la temporada
- Resultados actualizados en tiempo real
- Próximos partidos y estadísticas previas

### **5. Resumen Semanal**
- Panel 30/70: Clasificación + Noticias
- Acordeón de noticias por equipo
- Estadísticas consolidadas

### **6. Monitor del Sistema**
- Estado de APIs y servicios
- Últimas actualizaciones realizadas
- Métricas de rendimiento

## 🔧 **Tecnologías Utilizadas**

### **Frontend**
- **HTML5** - Semántica moderna y accesibilidad
- **CSS3** - Grid, Flexbox, animaciones, variables CSS
- **JavaScript ES6+** - Módulos, async/await, fetch API
- **FontAwesome** - Iconos y elementos visuales

### **Backend/Scripts**
- **Python 3.11** - Scraping y procesamiento de datos
- **BeautifulSoup4** - Parsing HTML/XML
- **Requests** - Client HTTP para APIs
- **CloudScraper** - Bypass de protecciones anti-bot

### **DevOps**
- **GitHub Actions** - CI/CD y automatización
- **Vercel** - Hosting y despliegue continuo
- **Git** - Control de versiones

### ** APIs Externas**
- **Football-Data.org** - Datos oficiales de LaLiga
- **FootyStats** - Estadísticas avanzadas

## 📊 **Monitoreo y Métricas**

### **Automatización**
- ✅ Actualización semanal automática
- ✅ Despliegue continuo en producción
- ✅ Monitor de estado del sistema
- ✅ Notificaciones de errores

### **Rendimiento**
- ⚡ Carga optimizada (< 2s)
- 📱 Mobile-first responsive
- 🎨 Animaciones CSS3 fluidas
- 🔍 SEO optimizado

### **Calidad de Datos**
- 🔄 Actualización en tiempo real
- ✅ Validación de datos
- 📈 Historial de cambios
- 🔍 Sistema de alertas

## 🤝 **Contribución**

### **Para contribuir:**
1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

### **Guía de Estilo**
- Seguir convenciones de código existentes
- Comentar funciones complejas
- Mantener compatibilidad mobile-first
- Testear en múltiples navegadores

## 📝 **Changelog**

### **v2.2.0** (Actual)
- ✨ Sistema de automatización completo
- 🤖 Chatbot integrado
- 📊 Nuevas estadísticas avanzadas
- 🎨 Rediseño responsive completo
- 🔧 Branch protection activada
- 📋 Pull requests requeridos
- 🚀 Deploy redundante (cada 12 horas)
- 📝 Sistema de monitoreo mejorado
- 🔍 Logs detallados con timestamps

### **v2.1.0**
- ✨ Sistema de automatización completo
- 🤖 Chatbot integrado
- 📊 Nuevas estadísticas avanzadas
- 🎨 Rediseño responsive completo

### **v2.0.0**
- 🔄 Migración a GitHub Actions
- 📱 Diseño mobile-first
- ⚡ Optimización de rendimiento

### **v1.0.0**
- 🎉 Versión inicial
- 📊 Dashboard básico
- 🏆 Clasificación LaLiga

## 📄 **Licencia**

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🌐 **Demo**

**Aplicación en producción:** [laliga-app.vercel.app](https://laliga-app.vercel.app)

**Actualización automática:** Cada miércoles a las 09:00 UTC

---

## 📞 **Contacto**

- **Desarrollador:** [ztogoc](https://github.com/ztogoc)
- **Proyecto:** [laliga-app](https://github.com/ztogoc/laliga-app)
- **Issues:** [GitHub Issues](https://github.com/ztogoc/laliga-app/issues)

---

*🚀 Hecho con ❤️ para los aficionados a LaLiga*