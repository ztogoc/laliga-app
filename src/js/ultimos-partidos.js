
// Función para cargar y mostrar los últimos partidos (forma de los equipos)
async function loadUltimosPartidos() {
    try {
        const response = await fetch('data/laliga_2025_26_ultimos5.json');
        const ultimosPartidosData = await response.json();
        
        renderUltimosPartidosTable(ultimosPartidosData);
    } catch (error) {
        console.error('Error al cargar últimos partidos:', error);
        const tbody = document.getElementById('ultimos-partidos-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9">Error al cargar los datos</td></tr>';
        }
    }
}

// Función para renderizar la tabla de últimos partidos
function renderUltimosPartidosTable(data) {
    const tbody = document.getElementById('ultimos-partidos-body');
    if (!tbody) return;
    
    // Convertir el objeto a array y ordenar por puntos (descendente)
    const teamsArray = Object.entries(data).map(([teamName, teamData]) => ({
        name: teamName,
        ...teamData
    })).sort((a, b) => b.stats.points - a.stats.points);
    
    tbody.innerHTML = teamsArray.map((team, index) => {
        const stats = team.stats;
        const matches = team.matches;
        
        // Calcular diferencia de goles
        const goalsFor = matches.reduce((sum, m) => sum + m.score_for, 0);
        const goalsAgainst = matches.reduce((sum, m) => sum + m.score_against, 0);
        const goalDiff = goalsFor - goalsAgainst;
        const goalDiffStr = goalDiff > 0 ? `+${goalDiff}` : goalDiff;
        
        // Generar HTML para los indicadores de forma con tooltips
        const formaHtml = matches.map((match, idx) => {
            let className = '';
            let label = '';
            let resultText = '';
            
            switch(match.result) {
                case 'W':
                    className = 'forma-win';
                    label = 'V';
                    resultText = 'Victoria';
                    break;
                case 'D':
                    className = 'forma-draw';
                    label = 'E';
                    resultText = 'Empate';
                    break;
                case 'L':
                    className = 'forma-loss';
                    label = 'D';
                    resultText = 'Derrota';
                    break;
            }
            
            // Crear tooltip con información del partido
            const venueText = match.venue === 'H' ? 'Local' : 'Visitante';
            const tooltipText = `${resultText}: ${team.name} ${match.score_for}-${match.score_against} ${match.opponent} - Jornada ${match.round}`;
            
            return `<div class="forma-box ${className}" title="${tooltipText}">${label}</div>`;
        }).join('');
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${stats.played}</td>
                <td>${stats.wins}</td>
                <td>${stats.draws}</td>
                <td>${stats.losses}</td>
                <td>${goalDiffStr}</td>
                <td>${stats.points}</td>
                <td><div class="forma-container">${formaHtml}</div></td>
            </tr>
        `;
    }).join('');
}

// Cargar últimos partidos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadUltimosPartidos();
});
