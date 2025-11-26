// Página de estadísticas
// Lee localStorage y genera:
//  - Resumen global (#stats-global)
//  - Filtro Dificultad/Temática con selección interactiva
//  - Tabla de partidas (#stats-games)
//  - Botones limpiar / exportar

const backBtn = document.getElementById("back-btn");
if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

let currentFilter = 'difficulty'; // 'difficulty' o 'theme'
let selectedCategory = null;
let statsData = [];

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function renderGlobalSummary() {
    const statsGlobal = document.getElementById("stats-global");
    if (!statsGlobal) return;

    statsGlobal.innerHTML = "";

    if (statsData.length === 0) {
        statsGlobal.innerHTML = "<p style='text-align:center;'>No hay estadísticas todavía.</p>";
        return;
    }

    const total = statsData.length;
    const wins = statsData.filter(g => g.won).length;
    const losses = total - wins;
    const winRate = Math.round((wins / total) * 100);
    const avgTimeSec = statsData.reduce((a,b)=>a + (b.time||0),0) / total;
    const avgErrors = statsData.reduce((a,b)=>a + (b.errors||0),0) / total;

    const globalDiv = document.createElement('div');
    globalDiv.style.cssText = 'background:#e8f5e9; border:2px solid #4CAF50; border-radius:8px; padding:20px; margin:20px auto; max-width:600px;';
    globalDiv.innerHTML = `
        <h2 style="text-align:center; margin-top:0;">📈 Resumen Global</h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
            <div><strong>Total partidas:</strong> ${total}</div>
            <div><strong>% Ganadas:</strong> ${winRate}%</div>
            <div><strong>Ganadas:</strong> ${wins}</div>
            <div><strong>Perdidas:</strong> ${losses}</div>
            <div><strong>Tiempo medio:</strong> ${formatTime(Math.round(avgTimeSec))}</div>
            <div><strong>Errores medios:</strong> ${avgErrors.toFixed(1)}</div>
        </div>
    `;
    statsGlobal.appendChild(globalDiv);
}

function getCategories() {
    if (currentFilter === 'difficulty') {
        const levels = ["Fácil","Medio","Difícil","Avanzado","Maestro","Imposible"];
        return levels.filter(lv => statsData.some(g => g.level === lv));
    } else {
        // Obtener temáticas únicas jugadas
        const themes = [...new Set(statsData.map(g => g.theme))];
        return themes.sort();
    }
}

function renderCategoryList() {
    const categoryList = document.getElementById("category-list");
    if (!categoryList) return;

    categoryList.innerHTML = "";
    const categories = getCategories();

    if (categories.length === 0) {
        categoryList.innerHTML = "<p style='text-align:center; color:#999;'>No hay datos</p>";
        return;
    }

    const heading = document.createElement('h3');
    heading.textContent = currentFilter === 'difficulty' ? 'Dificultades' : 'Temáticas';
    heading.style.marginTop = '0';
    categoryList.appendChild(heading);

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.textContent = cat;
        item.addEventListener('click', () => {
            selectedCategory = cat;
            renderCategoryList();
            renderCategoryStats();
        });
        if (selectedCategory === cat) {
            item.classList.add('selected');
        }
        categoryList.appendChild(item);
    });

    // Auto-seleccionar la primera si no hay selección
    if (!selectedCategory || !categories.includes(selectedCategory)) {
        selectedCategory = categories[0];
        renderCategoryStats();
    }
}

function renderCategoryStats() {
    const categoryStats = document.getElementById("category-stats");
    if (!categoryStats || !selectedCategory) return;

    categoryStats.innerHTML = "";

    const filterKey = currentFilter === 'difficulty' ? 'level' : 'theme';
    const games = statsData.filter(g => g[filterKey] === selectedCategory);

    if (games.length === 0) {
        categoryStats.innerHTML = "<p style='text-align:center; color:#999;'>No hay datos para esta categoría</p>";
        return;
    }

    const wonCount = games.filter(g => g.won).length;
    const lostCount = games.length - wonCount;
    const avgTime = games.reduce((a,b)=>a + (b.time||0),0) / games.length;
    const avgErrors = games.reduce((a,b)=>a + (b.errors||0),0) / games.length;

    const statsDiv = document.createElement('div');
    statsDiv.innerHTML = `
        <h3 style="margin-top:0;">${selectedCategory}</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:15px;">
            <div><strong>Total partidas:</strong> ${games.length}</div>
            <div><strong>% Ganadas:</strong> ${Math.round((wonCount/games.length)*100)}%</div>
            <div><strong>Ganadas:</strong> ${wonCount}</div>
            <div><strong>Perdidas:</strong> ${lostCount}</div>
            <div><strong>Tiempo promedio:</strong> ${formatTime(Math.round(avgTime))}</div>
            <div><strong>Errores promedio:</strong> ${avgErrors.toFixed(1)}</div>
        </div>
    `;
    categoryStats.appendChild(statsDiv);
}

function renderGamesTable() {
    const statsGames = document.getElementById("stats-games");
    if (!statsGames) return;

    statsGames.innerHTML = "";

    if (statsData.length === 0) return;

    const heading = document.createElement('h2');
    heading.textContent = '🎮 Historial de Partidas';
    heading.style.textAlign = 'center';
    statsGames.appendChild(heading);

    const table = document.createElement('table');
    table.style.cssText = 'width:100%; border-collapse:collapse; margin:0 auto; max-width:1000px;';
    table.innerHTML = `
        <thead>
            <tr style="background:#333; color:white;">
                <th style="padding:10px; border:1px solid #ddd;">#</th>
                <th style="padding:10px; border:1px solid #ddd;">Nivel</th>
                <th style="padding:10px; border:1px solid #ddd;">Tema</th>
                <th style="padding:10px; border:1px solid #ddd;">Tiempo</th>
                <th style="padding:10px; border:1px solid #ddd;">Resultado</th>
                <th style="padding:10px; border:1px solid #ddd;">Errores</th>
                <th style="padding:10px; border:1px solid #ddd;">Fecha</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    
    statsData.forEach((g,i) => {
        const tr = document.createElement('tr');
        tr.style.cssText = i % 2 === 0 ? 'background:#f9f9f9;' : 'background:white;';
        const fecha = g.ts ? new Date(g.ts).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : "-";
        const resultLabel = g.reason === 'bomb' ? '💥 Bomba' : (g.won ? '✓ Ganada' : '✗ Perdida');
        const resultadoColor = g.reason === 'bomb' ? '#ff5722' : (g.won ? '#4CAF50' : '#f44336');
        tr.innerHTML = `
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${i+1}</td>
            <td style="padding:8px; border:1px solid #ddd;">${g.level}</td>
            <td style="padding:8px; border:1px solid #ddd;">${g.theme}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${formatTime(g.time || 0)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center; color:${resultadoColor}; font-weight:bold;">${resultLabel}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${g.errors ?? '-'}</td>
            <td style="padding:8px; border:1px solid #ddd; font-size:0.9em;">${fecha}</td>
        `;
        tbody.appendChild(tr);
    });
    
    statsGames.appendChild(table);
}

function renderStats() {
    statsData = JSON.parse(localStorage.getItem("sudokuStats")) || [];
    renderGlobalSummary();
    renderCategoryList();
    renderGamesTable();
}

// Filtros
const filterDifficultyBtn = document.getElementById('filter-difficulty');
const filterThemeBtn = document.getElementById('filter-theme');

if (filterDifficultyBtn) {
    filterDifficultyBtn.addEventListener('click', () => {
        currentFilter = 'difficulty';
        selectedCategory = null;
        filterDifficultyBtn.classList.add('active');
        filterThemeBtn.classList.remove('active');
        renderCategoryList();
    });
}

if (filterThemeBtn) {
    filterThemeBtn.addEventListener('click', () => {
        currentFilter = 'theme';
        selectedCategory = null;
        filterThemeBtn.classList.add('active');
        filterDifficultyBtn.classList.remove('active');
        renderCategoryList();
    });
}

// Botones acciones
const clearBtn = document.getElementById('clear-stats');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres borrar todas las estadísticas?')) {
            localStorage.removeItem('sudokuStats');
            renderStats();
        }
    });
}

const exportBtn = document.getElementById('export-stats');
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const stats = localStorage.getItem('sudokuStats') || '[]';
        const blob = new Blob([stats], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sudokuStats.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

window.addEventListener('DOMContentLoaded', renderStats);
