(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();document.addEventListener("DOMContentLoaded",function(){const e=document.getElementById("menuToggle"),o=document.querySelector(".nav-links-wrapper"),t=document.querySelector(".nav-overlay"),a=document.querySelectorAll(".nav-link"),r=document.documentElement;let s=!1,n=window.innerWidth<=1024;function i(){s=!s,e==null||e.classList.toggle("active"),o==null||o.classList.toggle("active"),t==null||t.classList.toggle("active"),r.style.overflow=s?"hidden":"",s?setTimeout(()=>{const l=o==null?void 0:o.querySelector("a");l==null||l.focus()},100):e==null||e.focus()}function p(){s&&(s=!1,e==null||e.classList.remove("active"),o==null||o.classList.remove("active"),t==null||t.classList.remove("active"),r.style.overflow="")}function y(l,m="smooth"){var v;if(!l||l==="#")return;const u=document.querySelector(l);if(!u)return;const g=((v=document.querySelector(".navbar"))==null?void 0:v.offsetHeight)||80,d=u.getBoundingClientRect().top+window.pageYOffset-g;window.scrollTo({top:d,behavior:m})}function h(){if(s)return;const l=window.scrollY+100;let m=!1;document.querySelectorAll("section[id]").forEach(u=>{const g=u.offsetTop-150,d=u.offsetHeight,v="#"+u.id;l>=g&&l<g+d&&a.forEach(j=>{j.getAttribute("href")===v?(j.classList.add("active"),m=!0):j.classList.remove("active")})}),m||a.forEach(u=>u.classList.remove("active"))}e==null||e.addEventListener("click",function(l){l.preventDefault(),l.stopPropagation(),i()}),t==null||t.addEventListener("click",p),a.forEach(l=>{l.addEventListener("click",function(m){const u=this.getAttribute("href");u&&u!=="#"&&(m.preventDefault(),n&&p(),a.forEach(g=>g.classList.remove("active")),this.classList.add("active"),y(u))})}),document.addEventListener("keydown",function(l){l.key==="Escape"&&s&&p()});let w;window.addEventListener("resize",function(){clearTimeout(w),w=setTimeout(function(){const l=n;n=window.innerWidth<=1024,(!n&&s||l!==n)&&p()},100)});let c;window.addEventListener("scroll",function(){window.clearTimeout(c),c=setTimeout(h,100)},!1),h(),window.location.hash&&setTimeout(()=>{y(window.location.hash,"auto"),setTimeout(h,500)},100)});let _="total",ne=[],L={total:[],home:[],away:[]},C=[],b=[],S=[],D=[],q=[],N=[],M=[],f={},F=!1;const k=document.getElementById("standings-body"),re=document.getElementById("leader-team"),ie=document.getElementById("total-teams"),ce=document.getElementById("max-points"),z=document.querySelectorAll(".tab-btn"),J=document.querySelectorAll(".nav-links a"),le=document.querySelectorAll(".section"),O=document.getElementById("assistants-list"),R=document.getElementById("top-assistant-1"),G=document.getElementById("goals90-list"),V=document.getElementById("assists90-list"),U=document.getElementById("penalty-scorers-list"),W=document.getElementById("top-penalty-scorer-1"),I=document.getElementById("comparison-table-body"),T=document.getElementById("player-filter"),$=document.getElementById("team-filter"),P=document.getElementById("performance-chart"),x=document.getElementById("porteros-cero-list"),Y=document.getElementById("top-portero-cero-1");async function de(){try{const o=await(await fetch("data/laliga_2025_26_canteras.json")).json(),t={};return o.canteras.forEach(a=>{const r=a.equipo;a.jugadores&&Array.isArray(a.jugadores)&&a.jugadores.forEach(s=>{if(s.Name){const n=s.Name.trim().toLowerCase();t[n]=r}})}),t}catch(e){return console.error("Error al cargar los datos de los equipos:",e),{}}}function ue(){var o;const e=new Set;return N.forEach(t=>{t.equipo&&t.equipo!=="Equipo"&&e.add(t.equipo)}),(o=L==null?void 0:L.total)!=null&&o.length&&L.total.forEach(t=>{t.equipo&&e.add(t.equipo)}),Array.from(e).sort((t,a)=>t.localeCompare(a))}function pe(){if(!$)return;const e=ue();e.length&&($.innerHTML='<option value="">Todos los equipos</option>',e.forEach(o=>{const t=document.createElement("option");t.value=o,t.textContent=o,$.appendChild(t)}))}function me(){if(F||!T||!$)return;const e=()=>{Q()};T.addEventListener("input",e),$.addEventListener("change",e),F=!0}function ge(){var a,r;let e=[...N];const o=(a=T==null?void 0:T.value)==null?void 0:a.trim().toLowerCase(),t=(r=$==null?void 0:$.value)==null?void 0:r.trim();return o&&(e=e.filter(s=>s.jugador.toLowerCase().includes(o))),t&&(e=e.filter(s=>s.equipo===t)),e}function Q(){if(!I)return;const e=ge();fe(e),he(e)}function fe(e){if(!e.length){I.innerHTML=`
            <tr>
                <td colspan="7"><div class="empty-state">No hay jugadores que coincidan con los filtros seleccionados.</div></td>
            </tr>
        `;return}const o=[...e].sort((t,a)=>a.impacto-t.impacto);I.innerHTML=o.map((t,a)=>{let r="",s=null;for(const n of ne)if(n.home_team===t.equipo||n.away_team===t.equipo){s=n;break}return s&&(r=(s.home_team===t.equipo?s.home_last5:s.away_last5).map(i=>`<span class="result-badge ${i.resultado==="G"?"result-win":i.resultado==="E"?"result-draw":"result-loss"}" 
                            title="${i.esLocal?"vs":"@"} ${i.rival} ${i.golesAFavor}-${i.golesEnContra}">
                        ${i.resultado}
                        </span>`).join(" ")),`
            <tr>
                <td>${a+1}</td>
                <td class="player-cell">
                    <span class="player-name">${t.jugador}</span>
                    <span class="player-team">${t.equipo}</span>
                </td>
                <td>${t.goles}</td>
                <td>${t.asistencias}</td>
                <td>${t.penaltis}</td>
                <td class="last5-results">${r||"Sin datos"}</td>
                <td class="impact-cell">
                    <div class="impact-bar" style="width: ${t.impacto/10*100}%"></div>
                    <span class="impact-value">${t.impacto.toFixed(1)}</span>
                </td>
            </tr>
        `}).join("")}function he(e){if(!P)return;if(!e.length){P.innerHTML='<div class="empty-state">Sin datos suficientes para mostrar el ranking.</div>';return}const o=e.slice(0,5),t=Math.max(...o.map(a=>a.impacto),1);P.innerHTML=o.map(a=>`
        <div class="performance-bar">
            <span class="player-label">${a.jugador}</span>
            <div class="bar-track">
                <div class="bar-fill" style="width:${a.impacto/t*100}%"></div>
            </div>
            <span class="impact-value">${a.impacto}</span>
        </div>
    `).join("")}async function X(){try{const o=await(await fetch("/data/laliga_2025_26_calendario.json")).json(),t=new Set,a=Object.keys(o).map(Number).sort((r,s)=>r-s);return a.forEach(r=>{const s=o[r];Array.isArray(s)&&s.forEach(n=>{n.home_team&&t.add(n.home_team),n.away_team&&t.add(n.away_team)})}),{jornadas:o,orden:a,equipos:Array.from(t).sort()}}catch(e){throw console.error("Error al cargar el calendario:",e),e}}function Z(e,o={}){const{jornadas:t,orden:a,equipos:r}=e,s=document.getElementById("calendario-container");if(!s)return{jornadas:a,equipos:r};s.innerHTML="";const n=o.jornada?Number(o.jornada):null,i=n?[n]:a,p=o.estado?o.estado.toLowerCase():"";let y=!1;const h=c=>{const l=new Date,m=c.date?new Date(`${c.date}T${c.time||"20:00"}`):null;return c.status==="Finalizado"?{texto:"Finalizado",clase:"finalizado"}:m&&m<=l&&c.status!=="Finalizado"?{texto:"En juego",clase:"en-juego"}:{texto:"Pendiente",clase:"pendiente"}},w=c=>p?p==="finalizado"?c==="finalizado":p==="pendiente"?c==="pendiente":p==="en juego"||p==="en-juego"||p==="en_juego"?c==="en-juego":!0:!0;if(i.forEach(c=>{const l=t[c];if(!Array.isArray(l)||l.length===0)return;const m=document.createElement("h3");m.textContent=`Jornada ${c}`,s.appendChild(m);let u=[...l];if(o.equipo&&(u=u.filter(d=>d.home_team===o.equipo||d.away_team===o.equipo)),p&&(u=u.filter(d=>{const{clase:v}=h(d);return w(v)})),u.length===0){const d=document.createElement("p");d.className="sin-resultados",d.textContent="No hay partidos que coincidan con los filtros seleccionados.",s.appendChild(d);return}const g=document.createElement("div");g.className="lista-partidos",u.forEach(d=>{const v=h(d),j=d.date?new Date(`${d.date}T${d.time||"20:00"}`):null,ae=j?j.toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}):"Fecha por confirmar",se=d.time||"--:--",B=document.createElement("div");B.className="partido",B.innerHTML=`
                <div class="partido-info">
                    <span class="fecha">${ae} ${se}</span>
                    <span class="estado ${v.clase}">${v.texto}</span>
                </div>
                <div class="equipos">
                    <div class="equipo local">
                        <span class="nombre">${d.home_team}</span>
                        ${d.home_score!==null&&d.home_score!==void 0?`<span class="goles">${d.home_score}</span>`:""}
                    </div>
                    <div class="vs">vs</div>
                    <div class="equipo visitante">
                        ${d.away_score!==null&&d.away_score!==void 0?`<span class="goles">${d.away_score}</span>`:""}
                        <span class="nombre">${d.away_team}</span>
                    </div>
                </div>
                <div class="estadio">${d.location||"Estadio por confirmar"}</div>
            `,g.appendChild(B)}),s.appendChild(g),y=!0}),!y){const c=document.createElement("p");c.className="sin-resultados",c.textContent="No hay partidos disponibles para los filtros seleccionados.",s.appendChild(c)}return{jornadas:a,equipos:r}}function ve(){if(!M.length||!x||!Y)return;const e=M[0];if(e){const o=f[e.jugador.trim().toLowerCase()]||"Equipo";Y.innerHTML=`
            <div class="trophy">🥇</div>
            <div class="scorer-info">
                <h3>${e.jugador}</h3>
                <p>${e.laliga_2025_26_porterias_a_cero} partidos sin encajar <span class="team-badge">${o}</span></p>
            </div>
        `}x.innerHTML=M.slice(1,10).map((o,t)=>{const a=f[o.jugador.trim().toLowerCase()]||"Equipo";return`
            <div class="scorer-item">
                <span class="position">${t+2}º</span>
                <span class="name">${o.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${o.laliga_2025_26_porterias_a_cero} partidos sin encajar</span>
                    <span class="team-badge">${a}</span>
                </div>
            </div>
        `}).join("")}async function E(e){const o=new URL(e,window.location.origin),t=`t=${new Date().getTime()}`;o.searchParams.set("_",t),console.log(`📤 Solicitando datos desde: ${o}`);try{const a=await fetch(o,{headers:{"Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache",Expires:"0"}});if(console.log(`📥 Respuesta recibida de ${e}:`,a.status,a.statusText),!a.ok){const s=await a.text();throw console.error(`❌ Error en la respuesta de ${e}:`,s),new Error(`Error al cargar ${e}: ${a.status} ${a.statusText} - ${s}`)}const r=await a.json();return console.log(`✅ Datos cargados correctamente de ${e}`,r),r}catch(a){throw console.error(`❌ Error al cargar ${e}:`,a),a}}function Ee(){if(!S.length||!G)return;const e=S[0];if(e){const o=document.getElementById("top-goals90-1");if(o){const t=f[e.jugador.trim().toLowerCase()]||"Equipo";o.querySelector("h3").textContent=e.jugador;const a=o.querySelector("p");a&&(a.innerHTML=`${e.goles_por_90} goles/90' <span class="team-badge">${t}</span>`)}}G.innerHTML=S.slice(1,10).map((o,t)=>{const a=f[o.jugador.trim().toLowerCase()]||"Equipo";return`
            <div class="scorer-item">
                <span class="position">${t+2}º</span>
                <span class="name">${o.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${o.goles_por_90} goles/90'</span>
                    <span class="team-badge">${a}</span>
                </div>
            </div>
        `}).join("")}function ye(){if(!D.length||!V)return;const e=D[0];if(e){const o=document.getElementById("top-assists90-1");if(o){const t=f[e.jugador.trim().toLowerCase()]||"Equipo";o.querySelector("h3").textContent=e.jugador;const a=o.querySelector("p");a&&(a.innerHTML=`${e.asistencias_por_90} asistencias/90' <span class="team-badge">${t}</span>`)}}V.innerHTML=D.slice(1,10).map((o,t)=>{const a=f[o.jugador.trim().toLowerCase()]||"Equipo";return`
            <div class="scorer-item">
                <span class="position">${t+2}º</span>
                <span class="name">${o.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${o.asistencias_por_90} asistencias/90'</span>
                    <span class="team-badge">${a}</span>
                </div>
            </div>
        `}).join("")}function _e(){if(!q.length||!U||!W)return;const e=q[0],o=f[e.jugador.trim().toLowerCase()]||"Equipo";e&&(W.innerHTML=`
            <div class="trophy">⚽</div>
            <div class="scorer-info">
                <h3>${e.jugador}</h3>
                <p class="player-stats">${e.penaltis_marcados} goles de penalti <span class="team-badge">${o}</span></p>
            </div>
        `),U.innerHTML=q.slice(1,10).map((t,a)=>{const r=f[t.jugador.trim().toLowerCase()]||"Equipo";return`
            <div class="scorer-item">
                <span class="position">${a+2}º</span>
                <span class="name">${t.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${t.penaltis_marcados} goles</span>
                    <span class="team-badge">${r}</span>
                </div>
            </div>
        `}).join("")}document.addEventListener("DOMContentLoaded",async()=>{const e=document.createElement("div");e.textContent="Cargando datos...",e.style.padding="20px",e.style.textAlign="center",document.body.appendChild(e);try{console.log("🔍 Iniciando carga de datos..."),console.log("🔄 Cargando datos de equipos de jugadores..."),f=await de(),console.log("✅ Datos de equipos de jugadores cargados correctamente");const[o,t,a,r,s,n,i,p,y]=await Promise.all([E("../../data/laliga_2025_26_clasificacion_total.json").catch(c=>(console.error("Error cargando clasificación total:",c),[])),E("../../data/laliga_2025_26_clasificacion_home.json").catch(c=>(console.error("Error cargando clasificación como local:",c),[])),E("../../data/laliga_2025_26_clasificacion_away.json").catch(c=>(console.error("Error cargando clasificación como visitante:",c),[])),E("../../data/laliga_2025_26_Goleadores.json").catch(c=>(console.error("Error cargando goleadores:",c),{maximos_goleadores:[]})),E("../../data/laliga_2025_26_asistentes.json").catch(c=>(console.error("Error cargando asistentes:",c),{maximos_asistentes:[]})),E("../../data/laliga_2025_26_goles_por_90.json").catch(c=>(console.error("Error cargando goles por 90:",c),{goles_por_90:[]})),E("../../data/laliga_2025_26_asistencias_por_90.json").catch(c=>(console.error("Error cargando asistencias por 90:",c),{asistencias_por_90:[]})),E("../../data/laliga_2025_26_penaltis.json").catch(c=>(console.error("Error cargando goleadores de penalti:",c),{penaltis_marcados_por_jugador:[]})),Te().catch(c=>(console.error("Error cargando lesionados:",c),[]))]);console.log("✅ Datos cargados correctamente"),L={total:o,home:t,away:a},C=r.maximos_goleadores||[],b=s.maximos_asistentes||[],S=n.goles_por_90||[],D=i.asistencias_por_90||[],q=p.penaltis_marcados_por_jugador||[],H(),$e(),Le(),we(),Ee(),ye(),_e(),je(),pe(),me(),Q(),console.log("🔄 Cargando datos de porterías a cero...");try{const c=await E("../../data/laliga_2025_26_porterias_a_cero.json");c&&c.laliga_2025_26_porterias_a_cero?(M=c.laliga_2025_26_porterias_a_cero.sort((l,m)=>m.laliga_2025_26_porterias_a_cero-l.laliga_2025_26_porterias_a_cero),ve(),console.log("✅ Datos de porterías a cero cargados correctamente")):console.error("❌ Formato de datos inesperado en el archivo de porterías a cero")}catch(c){console.error("❌ Error al cargar los datos de porterías a cero:",c),x&&(x.innerHTML='<div class="error">Error al cargar los datos de porterías a cero. Por favor, inténtalo de nuevo más tarde.</div>')}qe();const h=document.getElementById("calendario");if(h){const c=new IntersectionObserver(l=>{l.forEach(m=>{m.isIntersecting&&(console.log("🔍 Sección de calendario visible, cargando datos..."),X().then(u=>{const{jornadas:g,equipos:d}=Z(u);De(g,d)}).catch(u=>{console.error("❌ Error al cargar el calendario:",u);const g=document.getElementById("calendario-container");g&&(g.innerHTML=`
                                        <div class="error-message">
                                            <p>No se pudo cargar el calendario de partidos.</p>
                                            <button onclick="location.reload()" class="btn-retry">Reintentar</button>
                                        </div>
                                    `)}),c.disconnect())})},{threshold:.1});c.observe(h)}const w=new Date().toLocaleString();console.log("🔄 Última actualización:",w)}catch(o){console.error("❌ Error al cargar los datos:",o);const t=document.createElement("div");t.textContent="Error al cargar los datos. Por favor, recarga la página.",t.style.color="red",t.style.padding="20px",t.style.textAlign="center",document.body.appendChild(t)}finally{document.body.contains(e)&&document.body.removeChild(e)}});function H(){console.log("Actualizando clasificación para pestaña:",_);const e=L[_];if(!e||!e.length){console.error("No hay datos disponibles para la pestaña:",_);return}try{k.innerHTML="",e.map(t=>{const a=document.createElement("tr");return a.className=be(t.posicion-1,t.puntos),a.innerHTML=`
                <td>${t.posicion}</td>
                <td class="team-cell">
                    <span class="team-name">${t.equipo}</span>
                </td>
                <td class="points">${t.puntos}</td>
                <td>${t.partidos_jugados}</td>
                <td>${t.ganados}</td>
                <td>${t.empatados}</td>
                <td>${t.perdidos}</td>
                <td>${t.goles_a_favor}</td>
                <td>${t.goles_en_contra}</td>
                <td>${t.goles_a_favor-t.goles_en_contra}</td>
            `,a}).forEach(t=>k.appendChild(t)),console.log("Clasificación actualizada correctamente para:",_)}catch(o){console.error("Error al actualizar la clasificación:",o)}}function $e(){var o,t;const e=L.total;!e||!e.length||(re.textContent=((o=e[0])==null?void 0:o.equipo)||"-",ie.textContent=e.length,ce.textContent=((t=e[0])==null?void 0:t.puntos)||"0")}function Le(){if(!C.length)return;const e=C[0],o=document.getElementById("scorers-list"),t=f[e.jugador.trim().toLowerCase()]||"Equipo",a=document.getElementById("top-scorer-1");a&&e&&(a.innerHTML=`
            <div class="trophy">🥇</div>
            <div class="scorer-info">
                <h3>${e.jugador}</h3>
                <p class="player-stats">${e.goles} goles <span class="team-badge">${t}</span></p>
            </div>
        `),o&&(o.innerHTML=C.slice(1,10).map((r,s)=>{const n=f[r.jugador.trim().toLowerCase()]||"Equipo";return`
                <div class="scorer-item">
                    <span class="position">${s+2}º</span>
                    <span class="name">${r.jugador}</span>
                    <div class="scorer-details">
                        <span class="goals">${r.goles} goles</span>
                        <span class="team-badge">${n}</span>
                    </div>
                </div>
            `}).join(""))}function we(){if(!b.length||!O||!R)return;const e=b[0],o=f[e.jugador.trim().toLowerCase()]||"Equipo";e&&(R.innerHTML=`
            <div class="trophy">🎯</div>
            <div class="scorer-info">
                <h3>${e.jugador}</h3>
                <p class="player-stats">${e.asistencias} asistencias <span class="team-badge">${o}</span></p>
            </div>
        `),O.innerHTML=b.slice(1,10).map((t,a)=>{const r=f[t.jugador.trim().toLowerCase()]||"Equipo";return`
            <div class="scorer-item">
                <span class="position">${a+2}º</span>
                <span class="name">${t.jugador}</span>
                <div class="scorer-details">
                    <span class="goals">${t.asistencias} asistencias</span>
                    <span class="team-badge">${r}</span>
                </div>
            </div>
        `}).join("")}function je(){if(!I||!C.length&&!b.length&&!q.length)return;const e=new Map,o=t=>{if(!t)return null;const a=t.trim();return e.has(a)||e.set(a,{jugador:a,goles:0,asistencias:0,penaltis:0,equipo:f[a.trim().toLowerCase()]||"Equipo"}),e.get(a)};C.forEach(t=>{const a=o(t.jugador);a&&(a.goles=t.goles||0)}),b.forEach(t=>{const a=o(t.jugador);a&&(a.asistencias=t.asistencias||0)}),q.forEach(t=>{const a=o(t.jugador);a&&(a.penaltis=t.penaltis_marcados||0)}),N=Array.from(e.values()).map(t=>({...t,impacto:Ce(t)})).sort((t,a)=>a.impacto-t.impacto||a.goles+a.asistencias-(t.goles+t.asistencias))}function Ce(e){return+(e.goles*1.5+e.asistencias*1.2+e.penaltis*1).toFixed(2)}function be(e,o){return e<4?"champions-league":e<6?"europa-league":e>16?"relegation":""}function qe(){z.forEach(e=>{e.addEventListener("click",()=>{const o=e.dataset.tab;console.log("Cambiando a pestaña:",o),_!==o&&(z.forEach(t=>t.classList.remove("active")),e.classList.add("active"),_=o,console.log("Actualizando tabla para pestaña:",_),H())})}),J.forEach(e=>{e.addEventListener("click",o=>{o.preventDefault();const t=e.getAttribute("href").substring(1);J.forEach(a=>a.classList.remove("active")),e.classList.add("active"),le.forEach(a=>{a.classList.remove("active"),a.id===t&&(a.classList.add("active"),t==="clasificacion"&&(console.log("Sección de clasificación activada, actualizando..."),H()))})})}),console.log("Event listeners configurados, pestaña actual:",_)}async function Te(){console.log("🔍 Cargando datos de jugadores lesionados...");const e=await fetch("../../data/laliga_2025_26_lesionados_laliga.json?t=${new Date().getTime()}",{headers:{"Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache",Expires:"0"}});if(!e.ok)throw new Error(`Error al cargar los datos: ${e.status}`);const o=await e.json();console.log("✅ Datos de lesionados cargados correctamente");const t=document.getElementById("lesionados-update-date");return t&&(t.textContent=new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"})),Se(o),o}function Se(e){const o=document.getElementById("lesionados-container");if(!o)return;const t=e.filter(s=>s.jugadores&&s.jugadores.length>0),a=e.filter(s=>!s.jugadores||s.jugadores.length===0);if(t.length===0&&a.length===0){o.innerHTML='<p class="no-data">No hay datos de jugadores lesionados disponibles.</p>';return}let r="";if(t.length>0){const s=[...t].sort((n,i)=>i.jugadores.length-n.jugadores.length).slice(0,3);r+=`
            <div class="top-lesionados">
                <h2 class="top-lesionados-titulo">Equipos con más lesionados</h2>
                <div class="top-lesionados-list">
                    ${s.map((n,i)=>`
                        <div class="top-equipo-item">
                            <span class="top-position">${i+1}º</span>
                            <span class="top-equipo-nombre">${n.equipo_nombre}</span>
                            <span class="top-equipo-count">${n.jugadores.length} ${n.jugadores.length===1?"lesionado":"lesionados"}</span>
                        </div>
                    `).join("")}
                </div>
            </div>
        `,r+='<div class="equipos-lista">',t.sort((n,i)=>n.equipo_nombre.localeCompare(i.equipo_nombre)).forEach(n=>{r+=`
                <div class="equipo-lesionados">
                    <div class="equipo-header">
                        <img src="${n.escudo_url}" alt="${n.equipo_nombre}" class="equipo-escudo" title="${n.equipo_nombre}">
                        <h2 class="equipo-nombre">
                            ${n.equipo_nombre}
                            <span class="badge badge-lesionados">${n.jugadores.length}</span>
                            <i class="fas fa-chevron-down toggle-icon"></i>
                        </h2>
                    </div>
                    <div class="jugadores-container" style="display: none;">
                        <ul class="jugadores-list">
                            ${n.jugadores.map(i=>`
                                <li class="jugador-item">
                                    <div class="jugador-info">
                                        <h3>
                                            <a href="${i.url}" target="_blank" rel="noopener noreferrer">
                                                ${i.nombre}
                                            </a>
                                            <span class="jugador-posicion">${i.posicion}</span>
                                        </h3>
                                        <p><strong>Lesión:</strong> ${i.motivo_lesion}</p>
                                        <p class="jugador-vuelta">
                                            <i class="fas fa-ambulance"></i> 
                                            Vuelta estimada: ${i.vuelta_estimada||"Sin fecha estimada"}
                                        </p>
                                    </div>
                                    ${i.url_noticia?`
                                        <a href="${i.url_noticia}" 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           class="btn-more"
                                           title="Ver noticia sobre la lesión">
                                            <i class="fas fa-newspaper"></i> Noticia
                                        </a>
                                    `:""}
                                </li>
                            `).join("")}
                        </ul>
                    </div>
                </div>
            `}),r+="</div>"}a.length>0&&(r+=`
            <div class="sin-lesionados-container">
                <h3 class="sin-lesionados-titulo">
                    <i class="fas fa-check-circle"></i>
                    Equipos sin lesionados
                </h3>
                <div class="equipos-sin-lesionados">
                    ${a.sort((s,n)=>s.equipo_nombre.localeCompare(n.equipo_nombre)).map(s=>`
                            <span class="equipo-sin-lesionados">
                                <img src="${s.escudo_url}" alt="${s.equipo_nombre}" class="equipo-escudo" title="${s.equipo_nombre}">
                                ${s.equipo_nombre}
                            </span>
                        `).join("")}
                </div>
            </div>
        `),o.innerHTML=r,document.querySelectorAll(".equipo-header").forEach(s=>{s.addEventListener("click",function(){const n=this.nextElementSibling,i=this.querySelector(".toggle-icon");n.classList.toggle("show"),i.classList.toggle("fa-chevron-up"),i.classList.toggle("fa-chevron-down")})}),document.querySelectorAll(".jugadores-container").forEach(s=>{s.style.display="",s.classList.remove("show")})}function De(e,o){const t=document.getElementById("jornada-select"),a=document.getElementById("equipo-select"),r=document.getElementById("aplicar-filtros");!t||!a||!r||(e.forEach(s=>{const n=document.createElement("option");n.value=s,n.textContent=`Jornada ${s}`,t.appendChild(n)}),o.forEach(s=>{const n=document.createElement("option");n.value=s,n.textContent=s,a.appendChild(n)}),r.addEventListener("click",()=>{const s={jornada:t.value,equipo:a.value,estado:document.getElementById("estado-select").value};X().then(n=>Z(n,s)).catch(n=>console.error("Error al aplicar filtros:",n))}))}document.addEventListener("DOMContentLoaded",function(){fetch("data/laliga_2025_26_canteras.json").then(e=>e.json()).then(e=>{const o=e.canteras,t=document.getElementById("filtro-equipo");[...new Set(o.map(r=>r.equipo))].forEach(r=>{const s=document.createElement("option");s.value=r,s.textContent=r,t.appendChild(s)}),ee(o),te(o),document.getElementById("buscar-jugador").addEventListener("input",()=>A(o)),document.getElementById("filtro-equipo").addEventListener("change",()=>A(o)),document.getElementById("filtro-posicion").addEventListener("change",()=>A(o))}).catch(e=>console.error("Error al cargar los datos de canteras:",e))});function ee(e,o={}){const t=Ie(e);document.getElementById("total-jugadores").textContent=t;const a=document.querySelector("#estadisticas-posiciones");a.innerHTML="";const r={Portero:{count:0,icon:"fa-futbol"},Defensa:{count:0,icon:"fa-shield-alt"},Centrocampista:{count:0,icon:"fa-tasks"},Delantero:{count:0,icon:"fa-futbol"}};e.forEach(s=>{o.equipo&&s.equipo!==o.equipo||s.jugadores.forEach(n=>{const i=oe(n.Position||n.posicion);i==="Portero"?r.Portero.count++:i==="Defensa"?r.Defensa.count++:i==="Centrocampista"?r.Centrocampista.count++:i==="Delantero"&&r.Delantero.count++})}),Object.entries(r).forEach(([s,n])=>{const i=document.createElement("div");i.className="stat-card",i.innerHTML=`
            <div class="stat-value">${n.count}</div>
            <div class="stat-label">
                <i class="fas ${n.icon}"></i> ${s}
            </div>
        `,a.appendChild(i)})}function te(e,o={}){const t=document.getElementById("cuerpo-tabla-jugadores");t.innerHTML="";let a=0;e.forEach(r=>{o.equipo&&r.equipo!==o.equipo||r.jugadores.forEach(s=>{var p;const n=oe(s.Position);if(o.nombre&&!((p=s.Name)!=null&&p.toLowerCase().includes(o.nombre.toLowerCase()))||o.posicion&&s.Position!==o.posicion)return;const i=document.createElement("tr");i.innerHTML=`
                <td>${s["No."]||"¿?"}</td>
                <td>${s.Name||"¿?"}</td>
                <td>${r.equipo||"¿?"}</td>
                <td>${n}</td>
                <td>${K(s["Contract Start/End"])}</td>
                <td>${K(s["on Pitch"])}</td>
                <td>${Me(s.col_5)}</td>
            `,t.appendChild(i),a++})}),document.getElementById("total-jugadores").textContent=a}function A(e){const o=document.getElementById("buscar-jugador").value.toLowerCase(),t=document.getElementById("filtro-equipo").value,a=document.getElementById("filtro-posicion").value,s=JSON.parse(JSON.stringify(e)).filter(n=>!t||n.equipo===t).map(n=>({...n,jugadores:n.jugadores.filter(i=>{const p=!o||i.Name&&i.Name.toLowerCase().includes(o),y=!a||i.Position&&i.Position===a;return p&&y})})).filter(n=>n.jugadores.length>0);te(s,{equipo:t,posicion:a}),ee(s,{equipo:t})}function oe(e){return e?{Goalkeeper:"Portero",Defence:"Defensa",Midfield:"Centrocampista",Offence:"Delantero"}[e]||e:"¿?"}function K(e){if(!e)return"¿?";const[o,t]=e.includes("-")?e.split("-"):[e,null];return t?`${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][parseInt(t)-1]} ${o}`:o}function Me(e){if(!e)return"¿?";const o=e.replace(/\D/g,"");return o?`${o} min`:"¿?"}function Ie(e){return e.reduce((o,t)=>{var a;return o+(((a=t.jugadores)==null?void 0:a.length)||0)},0)}
