const backBtn = document.getElementById("back-btn");
backBtn.addEventListener("click", () => {
    window.location.href = "index.html"; // vuelve a la pantalla principal
});

// array de objetos con el historial de juegos
let gameHistory = []; // cada objeto: {level, theme, time, won, errors}

function recordGame(won) {
    gameHistory.push({
        level: currentLevel,
        theme: theme,
        time: seconds,       // tiempo en segundos desde timer
        won: won,            // true si se ganó, false si se reinicia
        errors: errorCount
    });
    // Guardar en localStorage para mantenerlo aunque recargues la página
    localStorage.setItem("sudokuStats", JSON.stringify(gameHistory));
}


// mostrar estadísticas al cargar la página
window.addEventListener("DOMContentLoaded", () => {
    // cargar datos de localStorage
    const statsContainer = document.getElementById("stats-container");
    let stats = JSON.parse(localStorage.getItem("sudokuStats")) || [];

    if (stats.length === 0) {
        statsContainer.innerHTML = "<p>No hay estadísticas todavía.</p>";
        return;
    }

    // agrupar por nivel
    const levels = ["Fácil","Medio","Difícil","Imposible"];
    levels.forEach(lv => {
        const games = stats.filter(g => g.level === lv);
        if (games.length === 0) return;

        let wonCount = games.filter(g => g.won).length;
        let lostCount = games.filter(g => !g.won).length;
        let avgTime = Math.round(games.reduce((a,b)=>a+b.time,0)/games.length);
        let avgErrors = Math.round(games.reduce((a,b)=>a+b.errors,0)/games.length);

        const div = document.createElement("div");
        div.innerHTML = `
            <h2>${lv}</h2>
            <p>Total partidas: ${games.length}</p>
            <p>Ganadas: ${wonCount} | Perdidas: ${lostCount} | % Ganadas: ${Math.round((wonCount/games.length)*100)}%</p>
            <p>Tiempo promedio: ${avgTime}s</p>
            <p>Errores promedio: ${avgErrors}</p>
        `;
        statsContainer.appendChild(div);
    });
});
