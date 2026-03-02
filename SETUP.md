# ⚙️ Configuración del Proyecto

Guía de configuración completa para el desarrollo y despliegue del proyecto LaLiga 2025-26.

## 📋 Requisitos Previos

### **Software Necesario**
- **Python 3.11+** - Para scripts de scraping
- **Node.js 18+** - Para desarrollo frontend
- **Git** - Control de versiones
- **Vercel CLI** - Despliegue (opcional)

### **Cuentas Externas**
- **GitHub** - Repositorio y Actions
- **Vercel** - Hosting y despliegue
- **Football-Data.org** - API key (opcional)

## 🔑 Variables de Entorno y Secrets

### **GitHub Actions Secrets**
Configura en: `GitHub → Repository → Settings → Secrets and variables → Actions`

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here  
VERCEL_PROJECT_ID=your_project_id_here

# GitHub Token (automático)
GITHUB_TOKEN=auto_generated
```

### **Cómo Obtener los Secrets de Vercel**

1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

2. **Login en Vercel**
```bash
vercel login
```

3. **Link del Proyecto**
```bash
vercel link
```

4. **Obtener IDs**
```bash
cat .vercel/project.json
```

El archivo `project.json` contendrá:
```json
{
  "orgId": "org_xxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxx"
}
```

## 🚀 Instalación Local

### **1. Clonar Repositorio**
```bash
git clone https://github.com/ztogoc/laliga-app.git
cd laliga-app
```

### **2. Configurar Python**
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r scripts/requirements.txt
```

### **3. Configurar Frontend**
```bash
# Instalar dependencias Node.js
npm install

# O usar Vite para desarrollo
npm run dev
```

### **4. Ejecutar Scripts Manualmente**
```bash
cd scripts
python refrescar.py
```

## 🔧 Configuración de Workflows

### **Workflow Principal: actualizar-datos.yml**
- **Ejecución:** Lunes 16:30 UTC + manual
- **Función:** Actualizar datos y desplegar
- **Requiere:** Secrets de Vercel configurados

### **Workflow Secundario: monitor-estados.yml**
- **Ejecución:** Cada 4 horas
- **Función:** Monitoreo de salud
- **Requiere:** Ningún secret adicional

## 📊 Estructura de Datos

### **Archivos JSON Generados**
```
data/
├── laliga_2025_26_clasificacion_total.json
├── laliga_2025_26_clasificacion_home.json
├── laliga_2025_26_clasificacion_away.json
├── laliga_2025_26_calendario.json
├── laliga_2025_26_goleadores.json
├── laliga_2025_26_asistentes.json
├── laliga_2025_26_lesionados_laliga.json
└── laliga_2025_26_canteras.json
```

### **Fuentes de Datos**
- **Football-Data.org**: Clasificación y resultados
- **FootyStats**: Estadísticas avanzadas
- **LaLiga.com**: Calendario oficial

## 🌐 Despliegue

### **Automático (Recomendado)**
Los workflows de GitHub Actions se encargan de:
1. Actualizar datos automáticamente
2. Hacer commit de cambios
3. Desplegar en Vercel

### **Manual**
```bash
# Desplegar en Vercel
vercel --prod

# O usar el workflow manual
# GitHub → Actions → "Actualizar Datos LaLiga" → "Run workflow"
```

## 🐛 Troubleshooting

### **Problemas Comunes**

#### **1. Error: "Could not retrieve Project Settings"**
```bash
# Eliminar configuración local
rm -rf .vercel

# Relinkear proyecto
vercel link
```

#### **2. Workflow falla en paso de Git**
```bash
# Verificar permisos del workflow
# GitHub → Settings → Actions → General → Workflow permissions
```

#### **3. Scripts Python fallan**
```bash
# Verificar entorno virtual
python --version  # Debe ser 3.11+
pip list          # Verificar paquetes instalados
```

#### **4. Datos no se actualizan**
```bash
# Verificar APIs externas
curl -H "X-Auth-Token: YOUR_API_KEY" https://api.football-data.org/v4/competitions/PD/standings
```

## 📈 Monitoreo

### **Métricas Disponibles**
- Estado de workflows en GitHub Actions
- Analytics de Vercel
- Logs de errores en scripts
- Rendimiento de APIs externas

### **Alertas**
- Email de GitHub Actions en fallos
- Notificaciones de Vercel en errores de despliegue
- Monitor de estado del sistema

## 🔐 Seguridad

### **Best Practices**
- Nunca commitear secrets en el repositorio
- Usar GitHub Secrets para variables sensibles
- Rotar tokens de Vercel periódicamente
- Limitar permisos de workflows al mínimo necesario

### **Permisos Recomendados**
```yaml
permissions:
  contents: write    # Para commits automáticos
  actions: read      # Para leer workflows
```

## 📞 Soporte

### **Recursos**
- [Documentación de GitHub Actions](https://docs.github.com/en/actions)
- [Documentación de Vercel](https://vercel.com/docs)
- [Football-Data.org API](https://www.football-data.org/documentation)

### **Contacto**
- **Issues**: [GitHub Issues](https://github.com/ztogoc/laliga-app/issues)
- **Desarrollador**: [ztogoc](https://github.com/ztogoc)

---

*📝 Mantén esta documentación actualizada con cualquier cambio en la configuración*
