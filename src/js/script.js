// Variables globales
// Add this near the top with other global variables
let currentTab = 'total';
let currentRound = 0;
let upcomingMatches = [];
let standingsData = {
    total: [],
    home: [],
    away: []
};
let scorersData = [];
let assistantsData = [];
let goalsPer90Data = [];
let assistsPer90RateData = [];
let penaltyScorersData = [];
let comparisonData = [];
let porterosCeroData = []; // Almacenará los datos de porterías a cero
let playersTeamData = {}; // Almacenará los datos de los equipos de los jugadores
let comparisonFiltersInitialized = false;

// Elementos del DOM
const standingsTable = document.getElementById('standings-body');
const leaderTeamEl = document.getElementById('leader-team');
const totalTeamsEl = document.getElementById('total-teams');
const maxPointsEl = document.getElementById('max-points');
const tabButtons = document.querySelectorAll('.tab-btn');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');
const assistantsListEl = document.getElementById('assistants-list');
const topAssistantEl = document.getElementById('top-assistant-1');
const goals90ListEl = document.getElementById('goals90-list');
const assists90ListEl = document.getElementById('assists90-list');
const penaltyScorersListEl = document.getElementById('penalty-scorers-list');
const topPenaltyScorerEl = document.getElementById('top-penalty-scorer-1');
const comparisonTableBody = document.getElementById('comparison-table-body');
const playerFilterInput = document.getElementById('player-filter');
const teamFilterSelect = document.getElementById('team-filter');
const performanceChartEl = document.getElementById('performance-chart');
const porterosCeroListEl = document.getElementById('porteros-cero-list');
const topPorteroCeroEl = document.getElementById('top-portero-cero-1');

// Función para cargar los datos de los equipos de los jugadores
async function loadPlayersTeamData() {
    try {
        const response = await fetch('data/laliga_2025_26_canteras.json');
        const data = await response.json();
        
        // Crear un mapeo de jugador a equipo
        const playerToTeam = {};
        
        // Recorrer todos los equipos
        data.canteras.forEach(team => {
            const teamName = team.equipo;
            
            // Si hay jugadores en el equipo, mapear cada jugador a su equipo
            if (team.jugadores && Array.isArray(team.jugadores)) {
                team.jugadores.forEach(player => {
                    if (player.Name) {
                        // Normalizar el nombre para evitar problemas de mayúsculas/minúsculas o espacios
                        const normalizedPlayerName = player.Name.trim().toLowerCase();
                        playerToTeam[normalizedPlayerName] = teamName;
                    }
                });
            }
        });
        
        return playerToTeam;
    } catch (error) {
        console.error('Error al cargar los datos de los equipos:', error);
        return {};
    }
}

function collectAvailableTeams() {
    const teams = new Set();

    comparisonData.forEach(item => {
        if (item.equipo && item.equipo !== 'Equipo') {
            teams.add(item.equipo);
        }
    });

    if (standingsData?.total?.length) {
        standingsData.total.forEach(team => {
            if (team.equipo) {
                teams.add(team.equipo);
            }
        });
    }

    return Array.from(teams).sort((a, b) => a.localeCompare(b));
}

function populateTeamFilter() {
    if (!teamFilterSelect) return;
    const teams = collectAvailableTeams();
    if (!teams.length) return;

    teamFilterSelect.innerHTML = '<option value="">Todos los equipos</option>';
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamFilterSelect.appendChild(option);
    });
}

function setupComparisonFilters() {
    if (comparisonFiltersInitialized) return;
    if (!playerFilterInput || !teamFilterSelect) return;

    const handleFiltersChange = () => {
        renderComparisonSection();
    };

    playerFilterInput.addEventListener('input', handleFiltersChange);
    teamFilterSelect.addEventListener('change', handleFiltersChange);
    comparisonFiltersInitialized = true;
}

function getFilteredComparisonData() {
    let filtered = [...comparisonData];

    const playerQuery = playerFilterInput?.value?.trim().toLowerCase();
    const teamValue = teamFilterSelect?.value?.trim();

    if (playerQuery) {
        filtered = filtered.filter(item => item.jugador.toLowerCase().includes(playerQuery));
    }

    if (teamValue) {
        filtered = filtered.filter(item => item.equipo === teamValue);
    }

    return filtered;
}

function renderComparisonSection() {
    if (!comparisonTableBody) return;
    const filteredData = getFilteredComparisonData();

    renderComparisonTable(filteredData);
    renderPerformanceChart(filteredData);
}

function renderComparisonTable(data) {
    if (!data.length) {
        comparisonTableBody.innerHTML = `
            <tr>
                <td colspan="7"><div class="empty-state">No hay jugadores que coincidan con los filtros seleccionados.</div></td>
            </tr>
        `;
        return;
    }

    // Sort by impact
    const sortedData = [...data].sort((a, b) => b.impacto - a.impacto);

    comparisonTableBody.innerHTML = sortedData.map((player, index) => {
        // Get team's last 5 results
        let last5Results = '';
        let nextMatch = null;
        
        // Find next match for player's team
        for (const match of upcomingMatches) {
            if (match.home_team === player.equipo || match.away_team === player.equipo) {
                nextMatch = match;
                break;
            }
        }
        
        // Get last 5 results for the team
        if (nextMatch) {
            const teamLast5 = nextMatch.home_team === player.equipo ? 
                nextMatch.home_last5 : nextMatch.away_last5;
            
            last5Results = teamLast5.map(match => {
                const resultadoClass = match.resultado === 'G' ? 'result-win' : 
                                     match.resultado === 'E' ? 'result-draw' : 'result-loss';
                
                return `<span class="result-badge ${resultadoClass}" 
                            title="${match.esLocal ? 'vs' : '@'} ${match.rival} ${match.golesAFavor}-${match.golesEnContra}">
                        ${match.resultado}
                        </span>`;
            }).join(' ');
        }

        return `
            <tr>
                <td>${index + 1}</td>
                <td class="player-cell">
                    <span class="player-name">${player.jugador}</span>
                    <span class="player-team">${player.equipo}</span>
                </td>
                <td>${player.goles}</td>
                <td>${player.asistencias}</td>
                <td>${player.penaltis}</td>
                <td class="last5-results">${last5Results || 'Sin datos'}</td>
                <td class="impact-cell">
                    <div class="impact-bar" style="width: ${(player.impacto / 10) * 100}%"></div>
                    <span class="impact-value">${player.impacto.toFixed(1)}</span>
                </td>
            </tr>
        `;
    }).join('');
}


// Add this function after the other utility functions
async function findUpcomingMatches() {
    try {
        const response = await fetch('data/laliga_2025_26_calendario.json');
        const calendario = await response.json();
        
        // Sort matches by date
        const partidos = Array.isArray(calendario) ? 
            [...calendario].sort((a, b) => new Date(a.date) - new Date(b.date)) : 
            [];
        
        // Find first match without a score
        const proximoPartido = partidos.find(p => p.home_score === null && p.away_score === null);
        
        if (proximoPartido) {
            currentRound = parseInt(proximoPartido.round);
            upcomingMatches = partidos.filter(p => parseInt(p.round) === currentRound);
            
            // Get unique teams in upcoming matches
            const equiposUnicos = new Set();
            upcomingMatches.forEach(match => {
                equiposUnicos.add(match.home_team);
                equiposUnicos.add(match.away_team);
            });
            
            // Get last 5 matches for each team
            const resultadosEquipos = {};
            
            for (const equipo of equiposUnicos) {
                const partidosEquipo = partidos.filter(p => 
                    (p.home_team === equipo || p.away_team === equipo) && 
                    p.home_score !== null && 
                    p.away_score !== null
                ).slice(-5);
                
                resultadosEquipos[equipo] = partidosEquipo.map(p => {
                    const esLocal = p.home_team === equipo;
                    const golesAFavor = esLocal ? p.home_score : p.away_score;
                    const golesEnContra = esLocal ? p.away_score : p.home_score;
                    const resultado = golesAFavor > golesEnContra ? 'G' : 
                                    golesAFavor === golesEnContra ? 'E' : 'P';
                    
                    return {
                        resultado,
                        golesAFavor,
                        golesEnContra,
                        rival: esLocal ? p.away_team : p.home_team,
                        esLocal
                    };
                });
            }
            
            // Add last 5 results to upcoming matches
            upcomingMatches = upcomingMatches.map(match => ({
                ...match,
                home_last5: resultadosEquipos[match.home_team] || [],
                away_last5: resultadosEquipos[match.away_team] || []
            }));
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error finding upcoming matches:', error);
        return false;
    }
}
function renderPerformanceChart(data) {
    if (!performanceChartEl) return;

    if (!data.length) {
        performanceChartEl.innerHTML = '<div class="empty-state">Sin datos suficientes para mostrar el ranking.</div>';
        return;
    }

    const topPlayers = data.slice(0, 5);
    const maxImpact = Math.max(...topPlayers.map(player => player.impacto), 1);

    performanceChartEl.innerHTML = topPlayers.map(player => `
        <div class="performance-bar">
            <span class="player-label">${player.jugador}</span>
            <div class="bar-track">
                <div class="bar-fill" style="width:${(player.impacto / maxImpact) * 100}%"></div>
            </div>
            <span class="impact-value">${player.impacto}</span>
        </div>
    `).join('');
}

// Función para cargar el calendario
async function loadCalendario() {
    try {
        const response = await fetch('/data/laliga_2025_26_calendario.json');
        const calendario = await response.json();

        const equipos = new Set();
        const jornadasOrdenadas = Object.keys(calendario)
            .map(Number)
            .sort((a, b) => a - b);

        jornadasOrdenadas.forEach(numero => {
            const jornada = calendario[numero];
            if (!Array.isArray(jornada)) return;

            jornada.forEach(partido => {
                if (partido.home_team) equipos.add(partido.home_team);
                if (partido.away_team) equipos.add(partido.away_team);
            });
        });

        return {
            jornadas: calendario,
            orden: jornadasOrdenadas,
            equipos: Array.from(equipos).sort()
        };
    } catch (error) {
        console.error('Error al cargar el calendario:', error);
        throw error;
    }
}

// Función para mostrar el calendario
function displayCalendario(calendarioData, filtros = {}) {
    const { jornadas, orden, equipos } = calendarioData;
    const container = document.getElementById('calendario-container');
    if (!container) return { jornadas: orden, equipos };

    container.innerHTML = '';

    const jornadaFiltrada = filtros.jornada ? Number(filtros.jornada) : null;
    const jornadasAMostrar = jornadaFiltrada ? [jornadaFiltrada] : orden;
    const estadoFiltro = filtros.estado ? filtros.estado.toLowerCase() : '';

    let seMostroAlguna = false;

    // Calcular jornada actual basándose en las fechas de los partidos
    let jornadaActual = null;
    const ahora = new Date();
    
    // Función auxiliar para obtener la fecha del primer partido de una jornada
    const getFechaJornada = (numero) => {
        const partidos = jornadas[numero];
        if (!Array.isArray(partidos) || partidos.length === 0) return null;
        
        // Obtener la fecha más temprana de los partidos de la jornada
        const fechas = partidos
            .filter(p => p.date)
            .map(p => new Date(p.date))
            .sort((a, b) => a - b);
        
        return fechas.length > 0 ? fechas[0] : null;
    };
    
    // Buscar la jornada actual: la primera cuya fecha sea >= hoy
    for (const numero of orden) {
        const fechaJornada = getFechaJornada(numero);
        if (fechaJornada && fechaJornada >= ahora) {
            jornadaActual = numero;
            break;
        }
    }
    
    // Si no se encontró jornada futura, usar la última jornada disponible
    if (!jornadaActual && orden.length > 0) {
        jornadaActual = orden[orden.length - 1];
    }

    const obtenerEstado = (partido) => {
        const ahora = new Date();
        const fecha = partido.date ? new Date(`${partido.date}T${partido.time || '20:00'}`) : null;

        if (partido.status === 'Finalizado') return { texto: 'Finalizado', clase: 'finalizado' };
        if (fecha && fecha <= ahora && partido.status !== 'Finalizado') return { texto: 'En juego', clase: 'en-juego' };
        return { texto: 'Pendiente', clase: 'pendiente' };
    };

    const coincideEstado = (claseEstado) => {
        if (!estadoFiltro) return true;
        if (estadoFiltro === 'finalizado') return claseEstado === 'finalizado';
        if (estadoFiltro === 'pendiente') return claseEstado === 'pendiente';
        if (estadoFiltro === 'en juego' || estadoFiltro === 'en-juego' || estadoFiltro === 'en_juego') {
            return claseEstado === 'en-juego';
        }
        return true;
    };

    jornadasAMostrar.forEach(numero => {
        const partidos = jornadas[numero];
        if (!Array.isArray(partidos) || partidos.length === 0) return;

        let partidosFiltrados = [...partidos];

        if (filtros.equipo) {
            partidosFiltrados = partidosFiltrados.filter(partido =>
                partido.home_team === filtros.equipo || partido.away_team === filtros.equipo
            );
        }

        if (estadoFiltro) {
            partidosFiltrados = partidosFiltrados.filter(partido => {
                const { clase } = obtenerEstado(partido);
                return coincideEstado(clase);
            });
        }

        if (partidosFiltrados.length === 0 && jornadaFiltrada) {
            const mensaje = document.createElement('p');
            mensaje.className = 'sin-resultados';
            mensaje.textContent = 'No hay partidos que coincidan con los filtros seleccionados.';
            container.appendChild(mensaje);
            return;
        }

        // Crear contenedor de jornada tipo acordeón
        const jornadaContainer = document.createElement('div');
        const esJornadaActual = numero === jornadaActual;
        jornadaContainer.className = `jornada-acordeon ${esJornadaActual ? 'jornada-actual' : ''}`;
        
        // Header de la jornada (clickeable)
        const jornadaHeader = document.createElement('div');
        jornadaHeader.className = 'jornada-header';
        
        // Contar partidos finalizados y pendientes
        const finalizados = partidos.filter(p => p.status === 'Finalizado').length;
        const pendientes = partidos.length - finalizados;
        
        jornadaHeader.innerHTML = `
            <div class="jornada-info">
                <h3 class="jornada-titulo">Jornada ${numero}</h3>
                ${esJornadaActual ? '<span class="jornada-badge">ACTUAL</span>' : ''}
                <span class="jornada-stats">${finalizados}/${partidos.length} finalizados</span>
            </div>
            <i class="fas fa-chevron-down jornada-toggle-icon ${esJornadaActual ? 'rotate' : ''}"></i>
        `;
        
        // Contenido de la jornada (desplegable)
        const jornadaContent = document.createElement('div');
        jornadaContent.className = 'jornada-content';
        if (esJornadaActual) {
            jornadaContent.classList.add('show');
        }

        const lista = document.createElement('div');
        lista.className = 'lista-partidos';

        if (partidosFiltrados.length === 0) {
            const mensaje = document.createElement('p');
            mensaje.className = 'sin-resultados';
            mensaje.textContent = 'No hay partidos que coincidan con los filtros seleccionados.';
            lista.appendChild(mensaje);
        } else {
            partidosFiltrados.forEach(partido => {
                const estado = obtenerEstado(partido);
                const fechaPartido = partido.date ? new Date(`${partido.date}T${partido.time || '20:00'}`) : null;
                const fechaTexto = fechaPartido
                    ? fechaPartido.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Fecha por confirmar';
                const horaTexto = partido.time || '--:--';

                const partidoEl = document.createElement('div');
                partidoEl.className = 'partido';
                partidoEl.innerHTML = `
                    <div class="partido-info">
                        <span class="fecha">${fechaTexto} ${horaTexto}</span>
                        <span class="estado ${estado.clase}">${estado.texto}</span>
                    </div>
                    <div class="equipos">
                        <div class="equipo local">
                            <span class="nombre">${partido.home_team}</span>
                            ${partido.home_score !== null && partido.home_score !== undefined ? `<span class="goles">${partido.home_score}</span>` : ''}
                        </div>
                        <div class="vs">vs</div>
                        <div class="equipo visitante">
                            ${partido.away_score !== null && partido.away_score !== undefined ? `<span class="goles">${partido.away_score}</span>` : ''}
                            <span class="nombre">${partido.away_team}</span>
                        </div>
                    </div>
                    <div class="estadio">${partido.location || 'Estadio por confirmar'}</div>
                `;

                lista.appendChild(partidoEl);
            });
        }

        jornadaContent.appendChild(lista);
        jornadaContainer.appendChild(jornadaHeader);
        jornadaContainer.appendChild(jornadaContent);
        container.appendChild(jornadaContainer);
        
        // Event listener para expandir/colapsar
        jornadaHeader.addEventListener('click', () => {
            jornadaContent.classList.toggle('show');
            const icon = jornadaHeader.querySelector('.jornada-toggle-icon');
            icon.classList.toggle('rotate');
        });
        
        seMostroAlguna = true;
    });

    if (!seMostroAlguna) {
        const mensaje = document.createElement('p');
        mensaje.className = 'sin-resultados';
        mensaje.textContent = 'No hay partidos disponibles para los filtros seleccionados.';
        container.appendChild(mensaje);
    }

    return {
        jornadas: orden,
        equipos
    };
}

// Función para cargar los datos de porterías a cero
async function loadPorteriasCeroData() {
    try {
        console.log('🔄 Cargando datos de porterías a cero...');
        const data = await loadJSON('data/laliga_2025_26_porterias_a_cero.json');
        
        // Verificar si la estructura de datos es la esperada
        if (data && data.laliga_2025_26_porterias_a_cero) {
            // Ordenar por número de porterías a cero (de mayor a menor)
            porterosCeroData = data.laliga_2025_26_porterias_a_cero.sort((a, b) => 
                b.laliga_2025_26_porterias_a_cero - a.laliga_2025_26_porterias_a_cero
            );
            console.log('✅ Datos de porterías a cero cargados correctamente:', porterosCeroData);
            updatePorteriasCero();
        } else {
            console.error('❌ Formato de datos inesperado en el archivo de porterías a cero');
        }
    } catch (error) {
        console.error('❌ Error al cargar los datos de porterías a cero:', error);
        if (porterosCeroListEl) {
            porterosCeroListEl.innerHTML = '<div class="error">Error al cargar los datos de porterías a cero. Por favor, inténtalo de nuevo más tarde.</div>';
        }
    }
}

// Función para actualizar la interfaz con los datos de porterías a cero
function updatePorteriasCero() {
    if (!porterosCeroData.length || !porterosCeroListEl || !topPorteroCeroEl) return;

    // Actualizar el top 1
    const topPortero = porterosCeroData[0];
    if (topPortero) {
        // Obtener el equipo del portero
        const porteroTeam = playersTeamData[topPortero.jugador.trim().toLowerCase()] || 'Equipo';
        
        topPorteroCeroEl.innerHTML = `
            <div class="trophy">🥇</div>
            <div class="scorer-info">
                <h3>${topPortero.jugador}</h3>
                <p>${topPortero.laliga_2025_26_porterias_a_cero} partidos sin encajar <span class="team-badge">${porteroTeam}</span></p>
            </div>
        `;
    }

    // Actualizar la lista (empezando desde el segundo)
    porterosCeroListEl.innerHTML = porterosCeroData.slice(1, 10).map((portero, index) => {
        // Obtener el equipo del portero
        const porteroTeam = playersTeamData[portero.jugador.trim().toLowerCase()] || 'Equipo';
        
        return `
            <div class="scorer-item">
                <span class="position">${index + 2}º</span>
                <span class="name">${portero.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${portero.laliga_2025_26_porterias_a_cero} partidos sin encajar</span>
                    <span class="team-badge">${porteroTeam}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Función para cargar un archivo JSON con caché
async function loadJSON(url) {
    const fullUrl = new URL(url, window.location.origin);
    const cacheBuster = `t=${new Date().getTime()}`;
    fullUrl.searchParams.set('_', cacheBuster);
    
    console.log(`📤 Solicitando datos desde: ${fullUrl}`);
    
    try {
        const response = await fetch(fullUrl, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log(`📥 Respuesta recibida de ${url}:`, response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Error en la respuesta de ${url}:`, errorText);
            throw new Error(`Error al cargar ${url}: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Datos cargados correctamente de ${url}`, data);
        return data;
    } catch (error) {
        console.error(`❌ Error al cargar ${url}:`, error);
        throw error;
    }
}

// Actualizar la sección de goles por 90 minutos
function updateGoalsPer90() {
    if (!goalsPer90Data.length || !goals90ListEl) return;

    // Actualizar el top 1
    const topGoals90 = goalsPer90Data[0];
    if (topGoals90) {
        const topGoals90El = document.getElementById('top-goals90-1');
        if (topGoals90El) {
            // Obtener el equipo del jugador
            const playerTeam = playersTeamData[topGoals90.jugador.trim().toLowerCase()] || 'Equipo';
            
            topGoals90El.querySelector('h3').textContent = topGoals90.jugador;
            const playerStatsEl = topGoals90El.querySelector('p');
            if (playerStatsEl) {
                playerStatsEl.innerHTML = `${topGoals90.goles_por_90} goles/90' <span class="team-badge">${playerTeam}</span>`;
            }
        }
    }

    // Actualizar la lista (empezando desde el segundo)
    goals90ListEl.innerHTML = goalsPer90Data.slice(1, 10).map((item, index) => {
        // Obtener el equipo del jugador
        const playerTeam = playersTeamData[item.jugador.trim().toLowerCase()] || 'Equipo';
        
        return `
            <div class="scorer-item">
                <span class="position">${index + 2}º</span>
                <span class="name">${item.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${item.goles_por_90} goles/90'</span>
                    <span class="team-badge">${playerTeam}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Actualizar la sección de asistencias por 90 minutos
function updateAssistsPer90Rate() {
    if (!assistsPer90RateData.length || !assists90ListEl) return;

    // Actualizar el top 1
    const topAssists90 = assistsPer90RateData[0];
    if (topAssists90) {
        const topAssists90El = document.getElementById('top-assists90-1');
        if (topAssists90El) {
            // Obtener el equipo del jugador
            const playerTeam = playersTeamData[topAssists90.jugador.trim().toLowerCase()] || 'Equipo';
            
            topAssists90El.querySelector('h3').textContent = topAssists90.jugador;
            const playerStatsEl = topAssists90El.querySelector('p');
            if (playerStatsEl) {
                playerStatsEl.innerHTML = `${topAssists90.asistencias_por_90} asistencias/90' <span class="team-badge">${playerTeam}</span>`;
            }
        }
    }

    // Actualizar la lista (empezando desde el segundo)
    assists90ListEl.innerHTML = assistsPer90RateData.slice(1, 10).map((item, index) => {
        // Obtener el equipo del jugador
        const playerTeam = playersTeamData[item.jugador.trim().toLowerCase()] || 'Equipo';
        
        return `
            <div class="scorer-item">
                <span class="position">${index + 2}º</span>
                <span class="name">${item.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${item.asistencias_por_90} asistencias/90'</span>
                    <span class="team-badge">${playerTeam}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Actualizar la sección de máximos goleadores de penalti
function updatePenaltyScorers() {
    if (!penaltyScorersData.length || !penaltyScorersListEl || !topPenaltyScorerEl) return;

    const topPenaltyScorer = penaltyScorersData[0];
    
    // Obtener el equipo del máximo goleador de penalti
    const topScorerTeam = playersTeamData[topPenaltyScorer.jugador.trim().toLowerCase()] || 'Equipo';

    // Actualizar el máximo goleador de penalti principal
    if (topPenaltyScorer) {
        topPenaltyScorerEl.innerHTML = `
            <div class="trophy">⚽</div>
            <div class="scorer-info">
                <h3>${topPenaltyScorer.jugador}</h3>
                <p class="player-stats">${topPenaltyScorer.penaltis_marcados} goles de penalti <span class="team-badge">${topScorerTeam}</span></p>
            </div>
        `;
    }

    // Actualizar la lista de goleadores de penalti (posición 2 en adelante)
    penaltyScorersListEl.innerHTML = penaltyScorersData.slice(1, 10).map((scorer, index) => {
        // Obtener el equipo del goleador
        const playerTeam = playersTeamData[scorer.jugador.trim().toLowerCase()] || 'Equipo';
        
        return `
            <div class="scorer-item">
                <span class="position">${index + 2}º</span>
                <span class="name">${scorer.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${scorer.penaltis_marcados} goles</span>
                    <span class="team-badge">${playerTeam}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Cargar los datos al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    const loadingElement = document.createElement('div');
    loadingElement.textContent = 'Cargando datos...';
    loadingElement.style.padding = '20px';
    loadingElement.style.textAlign = 'center';
    document.body.appendChild(loadingElement);
    
    try {
        console.log('🔍 Iniciando carga de datos...');

        // Cargar primero los datos de los equipos de los jugadores
        console.log('🔄 Cargando datos de equipos de jugadores...');
        playersTeamData = await loadPlayersTeamData();
        console.log('✅ Datos de equipos de jugadores cargados correctamente');

        // Cargar el resto de datos en paralelo
        const [totalData, homeData, awayData, scorersJson, asistentesJson, goles90Json, asistencias90Json, penaltisJson, lesionadosData] = await Promise.all([
            loadJSON('../../data/laliga_2025_26_clasificacion_total.json').catch(error => {
                console.error('Error cargando clasificación total:', error);
                return [];
            }),
            loadJSON('../../data/laliga_2025_26_clasificacion_home.json').catch(error => {
                console.error('Error cargando clasificación como local:', error);
                return [];
            }),
            loadJSON('../../data/laliga_2025_26_clasificacion_away.json').catch(error => {
                console.error('Error cargando clasificación como visitante:', error);
                return [];
            }),
            loadJSON('../../data/laliga_2025_26_Goleadores.json').catch(error => {
                console.error('Error cargando goleadores:', error);
                return { maximos_goleadores: [] };
            }),
            loadJSON('../../data/laliga_2025_26_asistentes.json').catch(error => {
                console.error('Error cargando asistentes:', error);
                return { maximos_asistentes: [] };
            }),
            loadJSON('../../data/laliga_2025_26_goles_por_90.json').catch(error => {
                console.error('Error cargando goles por 90:', error);
                return { goles_por_90: [] };
            }),
            loadJSON('../../data/laliga_2025_26_asistencias_por_90.json').catch(error => {
                console.error('Error cargando asistencias por 90:', error);
                return { asistencias_por_90: [] };
            }),
            loadJSON('../../data/laliga_2025_26_penaltis.json').catch(error => {
                console.error('Error cargando goleadores de penalti:', error);
                return { penaltis_marcados_por_jugador: [] };
            }),
            loadLesionados().catch(error => {
                console.error('Error cargando lesionados:', error);
                return [];
            })
        ]);

        console.log('✅ Datos cargados correctamente');
        
        // Asignar los datos
        standingsData = { total: totalData, home: homeData, away: awayData };
        scorersData = scorersJson.maximos_goleadores || [];
        assistantsData = asistentesJson.maximos_asistentes || [];
        goalsPer90Data = goles90Json.goles_por_90 || [];
        assistsPer90RateData = asistencias90Json.asistencias_por_90 || [];
        penaltyScorersData = penaltisJson.penaltis_marcados_por_jugador || [];

        // Actualizar la interfaz
        updateStandings();
        updateStats();
        updateTopScorers();
        updateTopAssistants();
        updateGoalsPer90();
        updateAssistsPer90Rate();
        updatePenaltyScorers();
        buildComparisonData();
        populateTeamFilter();
        setupComparisonFilters();
        renderComparisonSection();
        
        // Cargar datos de porterías a cero
        console.log('🔄 Cargando datos de porterías a cero...');
        try {
            const porteriasCeroData = await loadJSON('../../data/laliga_2025_26_porterias_a_cero.json');
            if (porteriasCeroData && porteriasCeroData.laliga_2025_26_porterias_a_cero) {
                porterosCeroData = porteriasCeroData.laliga_2025_26_porterias_a_cero.sort((a, b) => 
                    b.laliga_2025_26_porterias_a_cero - a.laliga_2025_26_porterias_a_cero
                );
                updatePorteriasCero();
                console.log('✅ Datos de porterías a cero cargados correctamente');
            } else {
                console.error('❌ Formato de datos inesperado en el archivo de porterías a cero');
            }
        } catch (error) {
            console.error('❌ Error al cargar los datos de porterías a cero:', error);
            if (porterosCeroListEl) {
                porterosCeroListEl.innerHTML = '<div class="error">Error al cargar los datos de porterías a cero. Por favor, inténtalo de nuevo más tarde.</div>';
            }
        }
        
        // Configurar eventos
        setupEventListeners();
        
        // Cargar calendario cuando se acceda a la sección
        const seccionCalendario = document.getElementById('calendario');
        if (seccionCalendario) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log('🔍 Sección de calendario visible, cargando datos...');
                        loadCalendario()
                            .then(calendarioData => {
                                const { jornadas, equipos } = displayCalendario(calendarioData);
                                inicializarFiltrosCalendario(jornadas, equipos);
                            })
                            .catch(error => {
                                console.error('❌ Error al cargar el calendario:', error);
                                const container = document.getElementById('calendario-container');
                                if (container) {
                                    container.innerHTML = `
                                        <div class="error-message">
                                            <p>No se pudo cargar el calendario de partidos.</p>
                                            <button onclick="location.reload()" class="btn-retry">Reintentar</button>
                                        </div>
                                    `;
                                }
                            });
                        observer.disconnect(); // Dejar de observar después de cargar una vez
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(seccionCalendario);
        }
        
        // Mostrar fecha de actualización
        const updateDate = new Date().toLocaleString();
        console.log('🔄 Última actualización:', updateDate);
        
    } catch (error) {
        console.error('❌ Error al cargar los datos:', error);
        const errorElement = document.createElement('div');
        errorElement.textContent = 'Error al cargar los datos. Por favor, recarga la página.';
        errorElement.style.color = 'red';
        errorElement.style.padding = '20px';
        errorElement.style.textAlign = 'center';
        document.body.appendChild(errorElement);
    } finally {
        // Eliminar el indicador de carga
        if (document.body.contains(loadingElement)) {
            document.body.removeChild(loadingElement);
        }
    }
});

// Actualizar la tabla de clasificación
function updateStandings() {
    console.log('Actualizando clasificación para pestaña:', currentTab);
    const data = standingsData[currentTab];
    
    if (!data || !data.length) {
        console.error('No hay datos disponibles para la pestaña:', currentTab);
        return;
    }

    try {
        // Limpiar la tabla antes de actualizar
        standingsTable.innerHTML = '';
        
        // Crear las filas de la tabla
        const rows = data.map(team => {
            const row = document.createElement('tr');
            row.className = getRowClass(team.posicion - 1, team.puntos);
            
            row.innerHTML = `
                <td>${team.posicion}</td>
                <td class="team-cell">
                    <span class="team-name">${team.equipo}</span>
                </td>
                <td class="points">${team.puntos}</td>
                <td>${team.partidos_jugados}</td>
                <td>${team.ganados}</td>
                <td>${team.empatados}</td>
                <td>${team.perdidos}</td>
                <td>${team.goles_a_favor}</td>
                <td>${team.goles_en_contra}</td>
                <td>${team.goles_a_favor - team.goles_en_contra}</td>
            `;
            
            return row;
        });
        
        // Agregar las filas a la tabla
        rows.forEach(row => standingsTable.appendChild(row));
        
        console.log('Clasificación actualizada correctamente para:', currentTab);
    } catch (error) {
        console.error('Error al actualizar la clasificación:', error);
    }
}

// Actualizar las estadísticas
function updateStats() {
    const data = standingsData.total;
    if (!data || !data.length) return;

    // Actualizar líder
    leaderTeamEl.textContent = data[0]?.equipo || '-';
    
    // Actualizar total de equipos
    totalTeamsEl.textContent = data.length;
    
    // Actualizar puntos máximos
    maxPointsEl.textContent = data[0]?.puntos || '0';
}

// Actualizar la sección de máximos goleadores
function updateTopScorers() {
    if (!scorersData.length) return;

    const topScorer = scorersData[0];
    const scorersList = document.getElementById('scorers-list');
    
    // Obtener el equipo del goleador principal
    const topScorerTeam = playersTeamData[topScorer.jugador.trim().toLowerCase()] || 'Equipo';
    
    // Actualizar el goleador principal
    const topScorerEl = document.getElementById('top-scorer-1');
    if (topScorerEl && topScorer) {
        topScorerEl.innerHTML = `
            <div class="trophy">🥇</div>
            <div class="scorer-info">
                <h3>${topScorer.jugador}</h3>
                <p class="player-stats">${topScorer.goles} goles <span class="team-badge">${topScorerTeam}</span></p>
            </div>
        `;
    }

    // Actualizar la lista de goleadores (posición 2 en adelante)
    if (scorersList) {
        scorersList.innerHTML = scorersData.slice(1, 10).map((scorer, index) => {
            // Obtener el equipo del jugador
            const playerTeam = playersTeamData[scorer.jugador.trim().toLowerCase()] || 'Equipo';
            
            return `
                <div class="scorer-item">
                    <span class="position">${index + 2}º</span>
                    <span class="name">${scorer.jugador}</span>
                    <div class="scorer-details">
                        <span class="goals">${scorer.goles} goles</span>
                        <span class="team-badge">${playerTeam}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Actualizar la sección de máximos asistentes
function updateTopAssistants() {
    if (!assistantsData.length || !assistantsListEl || !topAssistantEl) return;

    const topAssistant = assistantsData[0];
    
    // Obtener el equipo del asistente principal
    const topAssistantTeam = playersTeamData[topAssistant.jugador.trim().toLowerCase()] || 'Equipo';

    // Actualizar el máximo asistente principal
    if (topAssistant) {
        topAssistantEl.innerHTML = `
            <div class="trophy">🎯</div>
            <div class="scorer-info">
                <h3>${topAssistant.jugador}</h3>
                <p class="player-stats">${topAssistant.asistencias} asistencias <span class="team-badge">${topAssistantTeam}</span></p>
            </div>
        `;
    }

    // Actualizar la lista de asistentes (posición 2 en adelante)
    assistantsListEl.innerHTML = assistantsData.slice(1, 10).map((assistant, index) => {
        // Obtener el equipo del asistente
        const assistantTeam = playersTeamData[assistant.jugador.trim().toLowerCase()] || 'Equipo';
        
        return `
            <div class="scorer-item">
                <span class="position">${index + 2}º</span>
                <span class="name">${assistant.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${assistant.asistencias} asistencias</span>
                    <span class="team-badge">${assistantTeam}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Obtener clase CSS para la fila según la posición

function buildComparisonData() {
    if (!comparisonTableBody || (!scorersData.length && !assistantsData.length && !penaltyScorersData.length)) return;

    const playerMap = new Map();

    const ensureEntry = (name) => {
        if (!name) return null;
        const key = name.trim();
        if (!playerMap.has(key)) {
            playerMap.set(key, {
                jugador: key,
                goles: 0,
                asistencias: 0,
                penaltis: 0,
                equipo: playersTeamData[key.trim().toLowerCase()] || 'Equipo'
            });
        }
        return playerMap.get(key);
    };

    scorersData.forEach(item => {
        const entry = ensureEntry(item.jugador);
        if (entry) entry.goles = item.goles || 0;
    });

    assistantsData.forEach(item => {
        const entry = ensureEntry(item.jugador);
        if (entry) entry.asistencias = item.asistencias || 0;
    });

    penaltyScorersData.forEach(item => {
        const entry = ensureEntry(item.jugador);
        if (entry) entry.penaltis = item.penaltis_marcados || 0;
    });

    comparisonData = Array.from(playerMap.values()).map(player => ({
        ...player,
        impacto: calculateImpactScore(player)
    })).sort((a, b) => b.impacto - a.impacto || (b.goles + b.asistencias) - (a.goles + a.asistencias));
}

function calculateImpactScore(player) {
    const goalsWeight = 1.5;
    const assistsWeight = 1.2;
    const penaltiesWeight = 1;
    return +(player.goles * goalsWeight + player.asistencias * assistsWeight + player.penaltis * penaltiesWeight).toFixed(2);
}

function getRowClass(position, points) {
    if (position < 4) return 'champions-league';
    if (position < 6) return 'europa-league';
    if (position > 16) return 'relegation';
    return '';
}

// Configurar los event listeners
function setupEventListeners() {
    // Cambiar pestañas de clasificación
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newTab = button.dataset.tab;
            console.log('Cambiando a pestaña:', newTab);
            
            // Verificar si la pestaña ya está activa
            if (currentTab === newTab) return;
            
            // Actualizar botones activos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Actualizar la pestaña actual
            currentTab = newTab;
            
            // Forzar una actualización completa de la tabla
            console.log('Actualizando tabla para pestaña:', currentTab);
            updateStandings();
        });
    });

    // Navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Actualizar enlaces activos
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            // Mostrar sección correspondiente
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    
                    // Si la sección activa es la de clasificación, forzar actualización
                    if (targetId === 'clasificacion') {
                        console.log('Sección de clasificación activada, actualizando...');
                        updateStandings();
                    }
                }
            });
        });
    });
    
    // Forzar una actualización inicial
    console.log('Event listeners configurados, pestaña actual:', currentTab);
}

// Función para cargar datos de jugadores lesionados
async function loadLesionados() {
    console.log('🔍 Cargando datos de jugadores lesionados...');
    const response = await fetch('../../data/laliga_2025_26_lesionados_laliga.json?t=${new Date().getTime()}', {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error al cargar los datos: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Datos de lesionados cargados correctamente');
    
    // Actualizar la fecha de actualización
    const updateDate = document.getElementById('lesionados-update-date');
    if (updateDate) {
        updateDate.textContent = new Date().toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }
    
    // Mostrar los datos
    displayLesionados(data);
    
    // Devolver los datos para su uso posterior
    return data;
}

// Función para mostrar los jugadores lesionados
// Función para mostrar los jugadores lesionados
function displayLesionados(equipos) {
    const container = document.getElementById('lesionados-container');
    if (!container) return;
    
    // Filtrar equipos que tienen jugadores lesionados
    const equiposConLesionados = equipos.filter(equipo => 
        equipo.jugadores && equipo.jugadores.length > 0
    );
    const equiposSinLesionados = equipos.filter(equipo => 
        !equipo.jugadores || equipo.jugadores.length === 0
    );

    if (equiposConLesionados.length === 0 && equiposSinLesionados.length === 0) {
        container.innerHTML = '<p class="no-data">No hay datos de jugadores lesionados disponibles.</p>';
        return;
    }

    let html = '';

    // Mostrar equipos con más lesionados solo si hay equipos con lesionados
    if (equiposConLesionados.length > 0) {
        // Calcular el top 3 de equipos con más lesionados
        const topEquipos = [...equiposConLesionados]
            .sort((a, b) => b.jugadores.length - a.jugadores.length)
            .slice(0, 3);

        html += `
            <div class="top-lesionados">
                <h2 class="top-lesionados-titulo">Equipos con más lesionados</h2>
                <div class="top-lesionados-list">
                    ${topEquipos.map((equipo, index) => `
                        <div class="top-equipo-item">
                            <span class="top-position">${index + 1}º</span>
                            <span class="top-equipo-nombre">${equipo.equipo_nombre}</span>
                            <span class="top-equipo-count">${equipo.jugadores.length} ${equipo.jugadores.length === 1 ? 'lesionado' : 'lesionados'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Añadir lista de equipos con lesionados
        html += '<div class="equipos-lista">';
        equiposConLesionados.sort((a, b) => a.equipo_nombre.localeCompare(b.equipo_nombre)).forEach(equipo => {
            html += `
                <div class="equipo-lesionados">
                    <div class="equipo-header">
                        <img src="${equipo.escudo_url}" alt="${equipo.equipo_nombre}" class="equipo-escudo" title="${equipo.equipo_nombre}">
                        <h2 class="equipo-nombre">
                            ${equipo.equipo_nombre}
                            <span class="badge badge-lesionados">${equipo.jugadores.length}</span>
                            <i class="fas fa-chevron-down toggle-icon"></i>
                        </h2>
                    </div>
                    <div class="jugadores-container" style="display: none;">
                        <ul class="jugadores-list">
                            ${equipo.jugadores.map(jugador => `
                                <li class="jugador-item">
                                    <div class="jugador-info">
                                        <h3>
                                            <a href="${jugador.url}" target="_blank" rel="noopener noreferrer">
                                                ${jugador.nombre}
                                            </a>
                                            <span class="jugador-posicion">${jugador.posicion}</span>
                                        </h3>
                                        <p><strong>Lesión:</strong> ${jugador.motivo_lesion}</p>
                                        <p class="jugador-vuelta">
                                            <i class="fas fa-ambulance"></i> 
                                            Vuelta estimada: ${jugador.vuelta_estimada || 'Sin fecha estimada'}
                                        </p>
                                    </div>
                                    ${jugador.url_noticia ? `
                                        <a href="${jugador.url_noticia}" 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           class="btn-more"
                                           title="Ver noticia sobre la lesión">
                                            <i class="fas fa-newspaper"></i> Noticia
                                        </a>
                                    ` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    // Añadir sección de equipos sin lesionados si los hay
    if (equiposSinLesionados.length > 0) {
        html += `
            <div class="sin-lesionados-container">
                <h3 class="sin-lesionados-titulo">
                    <i class="fas fa-check-circle"></i>
                    Equipos sin lesionados
                </h3>
                <div class="equipos-sin-lesionados">
                    ${equiposSinLesionados.sort((a, b) => a.equipo_nombre.localeCompare(b.equipo_nombre))
                        .map(equipo => `
                            <span class="equipo-sin-lesionados">
                                <img src="${equipo.escudo_url}" alt="${equipo.equipo_nombre}" class="equipo-escudo" title="${equipo.equipo_nombre}">
                                ${equipo.equipo_nombre}
                            </span>
                        `).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Añadir event listeners para los encabezados de equipo
  // Añadir event listeners para los encabezados de equipo
    document.querySelectorAll('.equipo-header').forEach(header => {
        header.addEventListener('click', function() {
            const container = this.nextElementSibling;
            const icon = this.querySelector('.toggle-icon');
            
            // Toggle the show class
            container.classList.toggle('show');
            
            // Toggle the chevron icon
            icon.classList.toggle('fa-chevron-up');
            icon.classList.toggle('fa-chevron-down');
        });
    });
    // Inicialmente, colapsar todos los equipos
    document.querySelectorAll('.jugadores-container').forEach(container => {
        // Remove the inline style that's causing the issue
        container.style.display = '';
        // Ensure it's collapsed by default
        container.classList.remove('show');
    });
}

// Función para inicializar los filtros del calendario
function inicializarFiltrosCalendario(jornadas, equipos) {
    const selectJornada = document.getElementById('jornada-select');
    const selectEquipo = document.getElementById('equipo-select');
    const btnAplicarFiltros = document.getElementById('aplicar-filtros');
    
    if (!selectJornada || !selectEquipo || !btnAplicarFiltros) return;
    
    // Llenar selector de jornadas
    jornadas.forEach(jornada => {
        const option = document.createElement('option');
        option.value = jornada;
        option.textContent = `Jornada ${jornada}`;
        selectJornada.appendChild(option);
    });
    
    // Llenar selector de equipos
    equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo;
        option.textContent = equipo;
        selectEquipo.appendChild(option);
    });
    
    // Manejar clic en el botón de aplicar filtros
    btnAplicarFiltros.addEventListener('click', () => {
        const filtros = {
            jornada: selectJornada.value,
            equipo: selectEquipo.value,
            estado: document.getElementById('estado-select').value
        };
        
        // Volver a cargar el calendario con los filtros
        loadCalendario()
            .then(calendarioData => displayCalendario(calendarioData, filtros))
            .catch(error => console.error('Error al aplicar filtros:', error));
    });
}
