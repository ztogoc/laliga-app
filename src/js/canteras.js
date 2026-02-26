// src/js/canteras.js
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos de canteras
    fetch('data/laliga_2025_26_canteras.json')
        .then(response => response.json())
        .then(data => {
            const equipos = data.canteras;
            
            // Llenar filtro de equipos (sin duplicados)
            const filtroEquipo = document.getElementById('filtro-equipo');
            const equiposUnicos = [...new Set(equipos.map(e => e.equipo))];
            equiposUnicos.forEach(equipo => {
                const option = document.createElement('option');
                option.value = equipo;
                option.textContent = equipo;
                filtroEquipo.appendChild(option);
            });
            
            // Mostrar estadísticas
            actualizarEstadisticas(equipos);
            
            // Mostrar jugadores
            mostrarJugadores(equipos);
            
            // Configurar eventos de filtrado
            document.getElementById('buscar-jugador').addEventListener('input', () => filtrarJugadores(equipos));
            document.getElementById('filtro-equipo').addEventListener('change', () => filtrarJugadores(equipos));
            document.getElementById('filtro-posicion').addEventListener('change', () => filtrarJugadores(equipos));
        })
        .catch(error => console.error('Error al cargar los datos de canteras:', error));
});

function actualizarEstadisticas(equipos, filtros = {}) {
    const totalJugadores = calcularTotalJugadores(equipos);
    document.getElementById('total-jugadores').textContent = totalJugadores;
    
    // Calcular estadísticas de posiciones
    const statsContainer = document.querySelector('#estadisticas-posiciones');
    statsContainer.innerHTML = '';
    
    // Contar jugadores por posición
    const posiciones = {
        'Portero': { count: 0, icon: 'fa-futbol' },
        'Defensa': { count: 0, icon: 'fa-shield-alt' },
        'Centrocampista': { count: 0, icon: 'fa-tasks' },
        'Delantero': { count: 0, icon: 'fa-futbol' }
    };
    
    // Recorrer todos los equipos y jugadores
    equipos.forEach(equipo => {
        if (filtros.equipo && equipo.equipo !== filtros.equipo) return;
        
        equipo.jugadores.forEach(jugador => {
            const pos = traducirPosicion(jugador.Position || jugador.posicion);
            if (pos === 'Portero') posiciones['Portero'].count++;
            else if (pos === 'Defensa') posiciones['Defensa'].count++;
            else if (pos === 'Centrocampista') posiciones['Centrocampista'].count++;
            else if (pos === 'Delantero') posiciones['Delantero'].count++;
        });
    });
    
    // Mostrar estadísticas de posiciones
    Object.entries(posiciones).forEach(([posicion, data]) => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-value">${data.count}</div>
            <div class="stat-label">
                <i class="fas ${data.icon}"></i> ${posicion}
            </div>
        `;
        statsContainer.appendChild(statCard);
    });
}

function mostrarJugadores(equipos, filtros = {}) {
    const tbody = document.getElementById('cuerpo-tabla-jugadores');
    tbody.innerHTML = '';
    
    let jugadoresMostrados = 0;
    
    equipos.forEach(equipo => {
        if (filtros.equipo && equipo.equipo !== filtros.equipo) return;
        
        equipo.jugadores.forEach(jugador => {
            const posicion = traducirPosicion(jugador.Position);
            
            // Aplicar filtros
            if (filtros.nombre && !jugador.Name?.toLowerCase().includes(filtros.nombre.toLowerCase())) return;
            if (filtros.posicion && jugador.Position !== filtros.posicion) return;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${jugador['No.'] || '¿?'}</td>
                <td>${jugador.Name || '¿?'}</td>
                <td>${equipo.equipo || '¿?'}</td>
                <td>${posicion}</td>
                <td>${formatearFechaContrato(jugador['Contract Start/End'])}</td>
                <td>${formatearFechaContrato(jugador['on Pitch'])}</td>
                <td>${formatearMinutos(jugador['col_5'])}</td>
            `;
            tbody.appendChild(tr);
            jugadoresMostrados++;
        });
    });
    
    // Actualizar contador de jugadores mostrados
    document.getElementById('total-jugadores').textContent = jugadoresMostrados;
}

function filtrarJugadores(equipos) {
    const busqueda = document.getElementById('buscar-jugador').value.toLowerCase();
    const equipo = document.getElementById('filtro-equipo').value;
    const posicion = document.getElementById('filtro-posicion').value;
    
    // Crear una copia profunda de los equipos para no modificar el original
    const equiposFiltrados = JSON.parse(JSON.stringify(equipos));
    
    // Aplicar filtros
    const resultadosFiltrados = equiposFiltrados
        .filter(e => !equipo || e.equipo === equipo)
        .map(equipo => ({
            ...equipo,
            jugadores: equipo.jugadores.filter(jugador => {
                const cumpleBusqueda = !busqueda || 
                    (jugador.Name && jugador.Name.toLowerCase().includes(busqueda));
                const cumplePosicion = !posicion || 
                    (jugador.Position && jugador.Position === posicion);
                return cumpleBusqueda && cumplePosicion;
            })
        }))
        .filter(equipo => equipo.jugadores.length > 0);
    
    // Mostrar resultados
    mostrarJugadores(resultadosFiltrados, { busqueda, equipo, posicion });
    actualizarEstadisticas(resultadosFiltrados, { equipo, posicion });
}

// Funciones auxiliares
function traducirPosicion(posicionIngles) {
    if (!posicionIngles) return '¿?';
    
    const posiciones = {
        'Goalkeeper': 'Portero',
        'Defence': 'Defensa',
        'Midfield': 'Centrocampista',
        'Offence': 'Delantero'
    };
    return posiciones[posicionIngles] || posicionIngles;
}

function formatearFechaContrato(fecha) {
    if (!fecha) return '¿?';
    // Asumimos formato YYYY-MM o YYYY
    const [anio, mes] = fecha.includes('-') ? fecha.split('-') : [fecha, null];
    if (!mes) return anio; // Si solo hay año
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[parseInt(mes) - 1]} ${anio}`;
}

function formatearMinutos(minutosStr) {
    if (!minutosStr) return '¿?';
    // Extraer solo los números
    const minutos = minutosStr.replace(/\D/g, '');
    return minutos ? `${minutos} min` : '¿?';
}

function calcularTotalJugadores(equipos) {
    return equipos.reduce((total, equipo) => total + (equipo.jugadores?.length || 0), 0);
}