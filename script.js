// ==========================
// SUDOKU APP - reorganizado
// Bloque B (explicaciones por bloques) + D (temáticas centralizadas)
// ==========================

// ------------------------------
// 0) CONFIG / ALPHABETS (temáticas centralizadas)
// ------------------------------
// Añade nuevas temáticas aquí: key => mapping (1..9).
// Para añadir ROMANO, musical, etc., solo añade una nueva entrada.
const ALPHABETS = {
    classic: {1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9"},
    braille: {1:"⠁",2:"⠃",3:"⠉",4:"⠙",5:"⠑",6:"⠋",7:"⠛",8:"⠓",9:"⠊"},
    romano:  {1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI",7:"VII",8:"VIII",9:"IX"},
    musical: {1:"Do",2:"Re",3:"Mi",4:"Fa",5:"Sol",6:"La",7:"Si",8:"Do2",9:"Re2"}
};

// Tema por defecto
let theme = "classic"; // puede cambiarse desde un <select id="theme-select">

// Helper para obtener símbolo según tema y valor numérico
function renderSymbol(n) {
    if (!n) return "";
    const map = ALPHABETS[theme] || ALPHABETS.classic;
    return map[n] !== undefined ? map[n] : String(n);
}

// ------------------------------
// 1) GENERADOR / RESOLVER SUDOKU
// - createEmptyBoard: tablero 9x9 con ceros
// - isValid: comprueba validez en fila/col/box para la generación/solución
// - solve: backtracking clásico para rellenar/solucionar
// - generateFullSudoku: genera un sudoku completo aleatorio
// ------------------------------
function createEmptyBoard() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isValid(board, row, col, num) {
    // fila y columna
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }
    // bloque 3x3
    let br = Math.floor(row / 3) * 3;
    let bc = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
            if (board[br + r][bc + c] === num) return false;
    return true;
}

function solve(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                for (let n = 1; n <= 9; n++) {
                    if (isValid(board, r, c, n)) {
                        board[r][c] = n;
                        if (solve(board)) return true;
                        board[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function generateFullSudoku() {
    let board = createEmptyBoard();
    const nums = [1,2,3,4,5,6,7,8,9];
    // resolver con números en orden aleatorio para diversidad
    function solveRandom(b) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (b[r][c] === 0) {
                    shuffleArray(nums);
                    for (let i = 0; i < 9; i++) {
                        let n = nums[i];
                        if (isValid(b, r, c, n)) {
                            b[r][c] = n;
                            if (solveRandom(b)) return true;
                            b[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    solveRandom(board);
    return board;
}

// ------------------------------
// 2) REMOVER NÚMEROS (crear puzzle jugable)
// removeNumbersSmart: quita celdas pero evita dejar filas/cols/boxes con muy pocos números
// ------------------------------
function removeNumbersSmart(board, level) {
    let cellsToRemove;
    switch(level) {
        case "Fácil": cellsToRemove = 30; break;
        case "Medio": cellsToRemove = 40; break;
        case "Difícil": cellsToRemove = 50; break;
        case "Imposible": cellsToRemove = 60; break;
        default: cellsToRemove = 40;
    }

    let newBoard = board.map(row => row.slice());
    let positions = [];
    for (let i = 0; i < 9; i++)
        for (let j = 0; j < 9; j++)
            positions.push([i,j]);

    shuffleArray(positions);

    let removed = 0;
    for (let [r,c] of positions) {
        if (removed >= cellsToRemove) break;
        // contar pistas en fila/col/box
        let rowCount = newBoard[r].filter(x => x !== 0).length;
        let colCount = newBoard.map(row => row[c]).filter(x => x !== 0).length;
        let br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
        let boxCount = 0;
        for (let rr = 0; rr < 3; rr++)
            for (let cc = 0; cc < 3; cc++)
                if (newBoard[br+rr][bc+cc] !== 0) boxCount++;

        if (rowCount > 3 && colCount > 3 && boxCount > 3) {
            newBoard[r][c] = 0;
            removed++;
        }
    }
    return newBoard;
}

// ------------------------------
// 3) ESTADO GLOBAL Y HELPERS DE RENDER / TEMAS / NOTAS
// - currentPuzzle: puzzle mostrado (valores 0 para huecos)
// - originalPuzzle: copia para reiniciar
// - helpers: renderCellValue, createNoteSpan (para posicionar notas)
// ------------------------------
let currentPuzzle = [];
let originalPuzzle = [];
let currentLevel = "Fácil";
let errorCount = 0;
let notesMode = false;

// Para posicionar notas: (1..9) => posiciones relativas CSS
const NOTE_POSITIONS = {
    1: {top: "4%", left: "4%"},
    2: {top: "4%", left: "40%"},
    3: {top: "4%", left: "76%"},
    4: {top: "40%", left: "4%"},
    5: {top: "40%", left: "40%"},
    6: {top: "40%", left: "76%"},
    7: {top: "76%", left: "4%"},
    8: {top: "76%", left: "40%"},
    9: {top: "76%", left: "76%"}
};

// Crea un <span> posicionado para la nota n (usa renderSymbol para temas)
function createNoteSpan(n) {
    const sp = document.createElement("span");
    sp.dataset.num = n;
    sp.textContent = renderSymbol(n);
    sp.style.position = "absolute";
    sp.style.top = NOTE_POSITIONS[n].top;
    sp.style.left = NOTE_POSITIONS[n].left;
    sp.style.fontSize = "0.9em";
    sp.style.transform = "translate(-50%, -50%)";
    sp.style.userSelect = "none";
    return sp;
}

// ------------------------------
// 4) GESTIÓN DE ERRORES / CHECKING
// checkCell: verifica si "value" en (row,col) es válido respecto al tablero actual
// (NOTA) usamos currentPuzzle para validar lo que hay en pantalla
// ------------------------------
function checkCell(board, row, col, value) {
    // si vacio --> ok
    value = parseInt(value);
    if (!value) return true;

    for (let i = 0; i < 9; i++) {
        if (i !== col && board[row][i] === value) return false;
        if (i !== row && board[i][col] === value) return false;
    }
    let br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) {
            let rr = br + r, cc = bc + c;
            if ((rr !== row || cc !== col) && board[rr][cc] === value) return false;
        }
    return true;
}

// ------------------------------
// 5) RENDER / UI: displaySudoku
// - renderiza la cuadrícula completa
// - para cada celda: si fija -> texto (renderSymbol) , si hueco -> input + notesDiv
// - input: evento 'input' maneja modo notas vs modo normal y actualización del tablero
// ------------------------------
function displaySudoku(board) {
    const grid = document.getElementById("sudoku-grid");
    if (!grid) {
        console.error("No existe #sudoku-grid en el HTML");
        return;
    }
    grid.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = i; cell.dataset.col = j;
            // añadir bordes 3x3 usando clases (tu CSS ya gestiona .border-*)
            if (i % 3 === 0) cell.classList.add("border-top");
            if (i === 8) cell.classList.add("border-bottom");
            if (j % 3 === 0) cell.classList.add("border-left");
            if (j === 8) cell.classList.add("border-right");

            if (board[i][j] !== 0) {
                // CELDA FIJA: mostramos valor según el tema
                const sym = renderSymbol(board[i][j]);
                cell.textContent = sym;
                cell.classList.add("fixed-cell"); // CSS: estilo para fijas
                // centrar bien el texto (CSS debería usar flex/aligncenter)
            } else {
                // CELDA JUGABLE: input + contenedor notas
                const notesDiv = document.createElement("div");
                notesDiv.className = "notes";
                notesDiv.style.position = "absolute";
                notesDiv.style.width = "100%";
                notesDiv.style.height = "100%";
                notesDiv.style.pointerEvents = "none"; // evitar que interfiera con input
                notesDiv.style.fontSize = "0.8em";
                cell.appendChild(notesDiv);

                const input = document.createElement("input");
                input.type = "text";
                input.maxLength = 3; // permitimos notas (pero restringiremos)
                input.style.boxSizing = "border-box";
                input.style.textAlign = "center";

                // Evento principal: input del usuario
                input.addEventListener("input", function(e) {
                    // Limpiar caracteres no permitidos
                    this.value = this.value.replace(/[^0-9\u00A0-\uFFFF]/g, ""); // permitimos unicode para símbolos
                    // tomamos sólo el primer caracter numérico si no estamos en notas
                    const raw = this.value.trim();
                    const val = raw === "" ? 0 : parseInt(raw[0]) || 0;

                    if (notesMode) {
                        // MODO NOTAS: alternar notas en notesDiv
                        if (val) {
                            // obtener set de notas actuales
                            const existing = new Set();
                            notesDiv.querySelectorAll("span").forEach(s => existing.add(parseInt(s.dataset.num)));
                            if (existing.has(val)) existing.delete(val);
                            else existing.add(val);
                            // limpiar y volver a pintar
                            notesDiv.innerHTML = "";
                            Array.from(existing).sort().forEach(n => {
                                notesDiv.appendChild(createNoteSpan(n));
                            });
                        }
                        // no ponemos número principal en modo notas
                        this.value = "";
                        return;
                    } else {
                        // MODO NORMAL: poner número principal
                        // vaciar notas cuando escribimos
                        notesDiv.innerHTML = "";
                        currentPuzzle[i][j] = val;
                        // validar
                        if (!checkCell(currentPuzzle, i, j, val)) {
                            input.style.backgroundColor = "#ff4d4d";
                            errorCount++;
                            document.getElementById("error-count").textContent = errorCount;
                        } else {
                            // correcto -> dar estilo de celda escrita por jugador
                            input.style.backgroundColor = "#e0e0e0";
                        }
                        // mostrar símbolo según tema (si tema no classic, mostrar símbolo)
                        input.value = val ? renderSymbol(val) : "";
                    }

                    // chequeo de victoria
                    if (checkWin()) doWin();
                });

                cell.appendChild(input);
            }

            grid.appendChild(cell);
        }
    }
}

// ------------------------------
// 6) VICTORIA (animación / mensaje)
// - doWin: parar timer, añadir mensaje y confetti (si confetti existe)
// ------------------------------
function doWin() {
    clearInterval(timer);
    try {
        if (typeof confetti === "function") {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    } catch (e) { /* confetti puede no existir en GitHub si no cargaste CDN */ }

    // Mensaje central con fondo blanco
    let winMessage = document.getElementById("win-message");
    if (!winMessage) {
        winMessage = document.createElement("div");
        winMessage.id = "win-message";
        winMessage.textContent = "🎉 GANASTE 🎉";
        Object.assign(winMessage.style, {
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: "3em",
            color: "#ff6600",
            backgroundColor: "white",
            padding: "20px 40px",
            borderRadius: "10px",
            zIndex: "1000",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
        });
        document.body.appendChild(winMessage);
    }
}

// ------------------------------
// 7) NUEVO / REINICIAR SUDOKU (UI hooks)
// - newSudoku: genera puzzle y lo muestra
// - restartSudoku: restaura originalPuzzle a pantalla (borra inputs del jugador)
// ------------------------------
function newSudoku() {
    errorCount = 0;
    document.getElementById("error-count").textContent = errorCount;

    currentLevel = document.getElementById("difficulty") ? document.getElementById("difficulty").value : "Fácil";
    const full = generateFullSudoku();
    currentPuzzle = removeNumbersSmart(full, currentLevel);
    originalPuzzle = currentPuzzle.map(row => row.slice()); // clon profundo
    // ocultar mensaje de victoria si existe
    const wm = document.getElementById("win-message");
    if (wm) wm.remove();
    displaySudoku(currentPuzzle);
    startTimer();
}

function restartSudoku() {
    errorCount = 0;
    document.getElementById("error-count").textContent = errorCount;
    // restaurar copia
    currentPuzzle = originalPuzzle.map(row => row.slice());
    displaySudoku(currentPuzzle);
    startTimer();
}

// ligar botones (si existen)
const newBtn = document.getElementById("new-game");
if (newBtn) newBtn.addEventListener("click", newSudoku);
const restartBtn = document.getElementById("restart-game");
if (restartBtn) restartBtn.addEventListener("click", restartSudoku);
const toggleNotesBtn = document.getElementById("toggle-notes");
if (toggleNotesBtn) toggleNotesBtn.addEventListener("click", function() {
    notesMode = !notesMode;
    this.textContent = notesMode ? "Notas ON" : "Notas OFF";
    this.classList.toggle("active", notesMode);
});

// theme selector (si existe)
const themeSel = document.getElementById("theme-select");
if (themeSel) {
    themeSel.addEventListener("change", function() {
        theme = this.value;
        displaySudoku(currentPuzzle);
    });
}

// ------------------------------
// 8) TIMER
// ------------------------------
let timer; let seconds = 0;
function startTimer() {
    clearInterval(timer);
    seconds = 0;
    updateTimerDisplay();
    timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}
function updateTimerDisplay() {
    const m = String(Math.floor(seconds/60)).padStart(2,"0");
    const s = String(seconds%60).padStart(2,"0");
    const el = document.getElementById("timer");
    if (el) el.textContent = `Tiempo: ${m}:${s}`;
}

// ------------------------------
// 9) CHECK WIN (usa currentPuzzle + checkCell)
// ------------------------------
function checkWin() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const v = currentPuzzle[i][j];
            if (!v || !checkCell(currentPuzzle, i, j, v)) return false;
        }
    }
    return true;
}

// ------------------------------
// 10) INICIALIZACIÓN AL CARGAR SCRIP (intenta ligar elementos y lanzar un sudoku)
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // Si no hay valores por defecto en HTML, crea uno
    if (!document.getElementById("difficulty")) {
        const sel = document.createElement("select");
        sel.id = "difficulty";
        ["Fácil","Medio","Difícil","Imposible"].forEach(o => {
            const opt = document.createElement("option"); opt.text = o; sel.add(opt);
        });
        document.body.appendChild(sel);
    }
    // Ligar theme-select si no existe: creamos uno simple
    if (!document.getElementById("theme-select")) {
        const tsel = document.createElement("select");
        tsel.id = "theme-select";
        Object.keys(ALPHABETS).forEach(k => {
            const o = document.createElement("option"); o.value = k; o.text = k; tsel.add(o);
        });
        document.body.appendChild(tsel);
    }
    // Inicializar primer sudoku
    newSudoku();
});