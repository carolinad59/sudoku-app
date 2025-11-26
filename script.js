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
    musical: {1:"Do",2:"Re",3:"Mi",4:"Fa",5:"Sol",6:"La",7:"Si",8:"Do'",9:"Re'"},
    geometria: {1:"●",2:"■",3:"▲",4:"◆",5:"⬟",6:"⬢",7:"★",8:"✚",9:"✦"},
    colores: {1:"🔴",2:"🟠",3:"🟡",4:"🟢",5:"🔵",6:"🟣",7:"🟤",8:"⚫",9:"⚪"},
    flores:  {1:"🌹",2:"🌺",3:"🌻",4:"🌼",5:"🌷",6:"🌸",7:"🏵️",8:"💐",9:"🌿"},
    animales: {1:"🐶",2:"🐱",3:"🐰",4:"🦊",5:"🐻",6:"🐼",7:"🦁",8:"🐯",9:"🦘"},
    bombon: {1:"🍫",2:"🍬",3:"🍭",4:"🍯",5:"🍪",6:"🍩",7:"🧁",8:"🍰",9:"🍡"},
    amor: {1:"❤️",2:"🧡",3:"💛",4:"💚",5:"💙",6:"💜",7:"🖤",8:"🤍",9:"🤎"},
    mundo: {1:"🇫🇷",2:"🇪🇸",3:"🇺🇸",4:"🇦🇺",5:"🇮🇹",6:"🇬🇧",7:"🇯🇵",8:"🇧🇷",9:"🇨🇦"}
};

// Tema por defecto
let theme = "classic"; // puede cambiarse desde un <select id="theme-select">
// Matriz para marcar celdas introducidas en modo "Probar"
let probeMarked = Array.from({ length: 9 }, () => Array(9).fill(false));

// Helper para obtener símbolo según tema y valor numérico
function renderSymbol(n) {
    if (!n) return "";
    const map = ALPHABETS[theme] || ALPHABETS.classic;
    return map[n] !== undefined ? map[n] : String(n);
}

function getNumberFromSymbol(sym) {
    const map = ALPHABETS[theme];
    for (const [num, s] of Object.entries(map)) {
        if (s === sym) return parseInt(num);
    }
    return 0;
}

// Función para reproducir notas musicales (solo tema musical)
function playMusicalNote(noteNumber) {
    if (theme !== "musical") return; // Solo reproducir en tema musical
    
    // Frecuencias de notas musicales (Hz)
    const notes = {
        1: 261.63,  // Do (C4)
        2: 293.66,  // Re (D4)
        3: 329.63,  // Mi (E4)
        4: 349.23,  // Fa (F4)
        5: 392.00,  // Sol (G4)
        6: 440.00,  // La (A4)
        7: 493.88,  // Si (B4)
        8: 523.25,  // Do' (C5)
        9: 587.33   // Re' (D5)
    };
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = notes[noteNumber];
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // Si el audio context no funciona, continuar sin sonido
    }
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
            // intentar remover y comprobar unicidad de la solución
            const old = newBoard[r][c];
            newBoard[r][c] = 0;
            const solCount = countSolutions(newBoard, 2);
            if (solCount === 1) {
                removed++;
            } else {
                // no es único, restaurar
                newBoard[r][c] = old;
            }
        }
    }
    return newBoard;
}

// Contador de soluciones (backtracking) con límite para salir temprano
function countSolutions(board, limit) {
    let count = 0;

    function findEmpty(b) {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (b[r][c] === 0) return [r,c];
        return null;
    }

    function backtrack(b) {
        if (count >= limit) return; // stop early
        const pos = findEmpty(b);
        if (!pos) {
            count++;
            return;
        }
        const [r,c] = pos;
        for (let n = 1; n <= 9; n++) {
            if (isValid(b, r, c, n)) {
                b[r][c] = n;
                backtrack(b);
                b[r][c] = 0;
                if (count >= limit) return;
            }
        }
    }

    // Clonar tablero para no mutar el original
    const clone = board.map(row => row.slice());
    backtrack(clone);
    return count;
}

// ------------------------------
// 3) ESTADO GLOBAL Y HELPERS DE RENDER / TEMAS / NOTAS
// - currentPuzzle: puzzle mostrado (valores 0 para huecos)
// - originalPuzzle: copia para reiniciar
// - helpers: renderCellValue, createNoteSpan (para posicionar notas)
// ------------------------------
let currentPuzzle = [];
let originalPuzzle = [];
let solutionPuzzle = []; // Guardar la solución completa
let currentLevel = "Fácil";
let errorCount = 0;
let notesMode = false;
let probeMode = false; // Modo prueba
let selectedCell = null;

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

// Crea un <span> para la nota n (usa renderSymbol para temas)
function createNoteSpan(n) {
    const sp = document.createElement("span");
    sp.setAttribute("data-num", String(n)); // Asegurar que es string
    sp.textContent = renderSymbol(n);
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
            createCellElement(grid, board, i, j);
        }
    }
}

// Función auxiliar para crear cada celda (evita problemas de closure)
function createCellElement(grid, board, row, col) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = row;
    cell.dataset.col = col;
    
    // añadir bordes 3x3
    if (row % 3 === 0) cell.classList.add("border-top");
    if (row === 8) cell.classList.add("border-bottom");
    if (col % 3 === 0) cell.classList.add("border-left");
    if (col === 8) cell.classList.add("border-right");

    if (board[row][col] !== 0) {
        // CELDA FIJA: mostramos valor según el tema
        const sym = renderSymbol(board[row][col]);
        cell.textContent = sym;
        cell.classList.add("fixed-cell");
    } else {
        // CELDA JUGABLE: input + contenedor notas
        const notesDiv = document.createElement("div");
        notesDiv.className = "notes";
        notesDiv.style.position = "absolute";
        notesDiv.style.width = "100%";
        notesDiv.style.height = "100%";
        notesDiv.style.pointerEvents = "none";
        notesDiv.style.fontSize = "0.8em";
        cell.appendChild(notesDiv);

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 3;
        input.style.boxSizing = "border-box";
        input.style.textAlign = "center";
        input.readOnly = true; // Solo lectura: se ingresa desde el teclado numérico
        input.style.cursor = "not-allowed"; // Cursor indica que no se puede escribir

        // Evento principal: input del usuario (solo desde keypad)
        input.addEventListener("input", function(e) {
            handleCellInput(this, row, col, input, notesDiv);
        });

        cell.appendChild(input);
    }

    // al hacer click en la celda, la seleccionamos
    cell.addEventListener("click", () => {
        if (selectedCell) selectedCell.classList.remove("selected");
        selectedCell = cell;
        selectedCell.classList.add("selected");
    });

    grid.appendChild(cell);
}

// Función manejadora del input de celda (evita problemas de closure)
function handleCellInput(inputElement, row, col, input, notesDiv) {
    // Limpiar caracteres no permitidos
    inputElement.value = inputElement.value.replace(/[^0-9\u00A0-\uFFFF]/g, "");
    
    // tomamos sólo el primer caracter numérico
    const raw = inputElement.value.trim();
    const val = raw === "" ? 0 : parseInt(raw[0]) || 0;

    if (notesMode) {
        // MODO NOTAS: alternar notas en notesDiv
        if (val) {
            // obtener set de notas actuales
            const existing = new Set();
            notesDiv.querySelectorAll("span").forEach(s => existing.add(parseInt(s.dataset.num)));
            if (existing.has(val)) {
                existing.delete(val);
            } else {
                existing.add(val);
            }
            // limpiar y volver a pintar
            notesDiv.innerHTML = "";
            Array.from(existing).sort((a, b) => a - b).forEach(n => {
                notesDiv.appendChild(createNoteSpan(n));
            });
        }
        // no ponemos número principal en modo notas
        inputElement.value = "";
        return;
    } else {
        // MODO NORMAL: poner número principal
        // Guardamos el valor anterior
        const prevVal = currentPuzzle[row][col];
        const wasIncorrect = prevVal !== 0 && prevVal !== solutionPuzzle[row][col];

        // Vaciar notas cuando escribimos un número
        notesDiv.innerHTML = "";

        // Guardamos el nuevo valor en el puzzle
        currentPuzzle[row][col] = val;

        if (probeMode) {
            // MODO PRUEBA: todo en azul, sin contar errores
            if (val === 0) {
                input.style.backgroundColor = "white";
                input.style.color = "black";
                input.value = "";
            } else {
                input.style.backgroundColor = "#4169E1"; // Azul oscuro
                input.style.color = "white";
                input.value = renderSymbol(val);
                // Reproducir nota musical si estamos en tema musical (también en prueba)
                playMusicalNote(val);
            }
        } else {
            // MODO NORMAL
            if (val === 0) {
                // celda vacía - restablecer a blanco
                input.style.backgroundColor = "white";
                input.style.color = "black";
                input.value = "";
                // Si era incorrecto antes, restar error
                if (wasIncorrect) {
                    errorCount--;
                    if (errorCount < 0) errorCount = 0;
                    document.getElementById("error-count").textContent = errorCount;
                }
            } else if (val !== solutionPuzzle[row][col]) {
                // número incorrecto
                input.style.backgroundColor = "#ff4d4d";
                input.style.color = "white";
                // Solo contar error si cambió a incorrecto (no era incorrecto antes)
                if (!wasIncorrect && prevVal !== val) {
                    errorCount++;
                    document.getElementById("error-count").textContent = errorCount;
                }
                input.value = renderSymbol(val);
            } else {
                // número correcto
                input.style.backgroundColor = "#c0e0c0";
                input.style.color = "black";
                input.value = renderSymbol(val);
                // Si era incorrecto antes, restar error
                if (wasIncorrect) {
                    errorCount--;
                    if (errorCount < 0) errorCount = 0;
                    document.getElementById("error-count").textContent = errorCount;
                }
                // Reproducir nota musical si estamos en tema musical
                playMusicalNote(val);
            }
        }
    }

    // chequeo de victoria/derrota
    const result = checkWin();
    if (result === "win") doWin();
    else if (result === "lose") doLose();
}
function displayKeypad() {
    const keypad = document.getElementById("keypad");
    if (!keypad) return;
    keypad.innerHTML = ""; // limpiar

    const symbols = ALPHABETS[theme]; // tema actual
    Object.values(symbols).forEach(sym => {
        const btn = document.createElement("button");
        btn.textContent = sym;
        btn.style.margin = "2px";
        btn.style.padding = "6px 10px";
        btn.style.fontSize = "1em";
        btn.style.cursor = "pointer";

        // evento click
        btn.addEventListener("click", () => {
            if (!selectedCell) return; // ninguna celda seleccionada

            const i = selectedCell.dataset.row;
            const j = selectedCell.dataset.col;

            if (selectedCell.classList.contains("fixed-cell")) return; // no modificar fijas

            const input = selectedCell.querySelector("input");
            const notesDiv = selectedCell.querySelector(".notes");
            const val = getNumberFromSymbol(sym);

            if (notesMode) {
                // MODO NOTAS: alternar notas
                const existing = new Set();
                notesDiv.querySelectorAll("span").forEach(s => existing.add(parseInt(s.dataset.num)));
                if (existing.has(val)) {
                    existing.delete(val);
                } else {
                    existing.add(val);
                }
                // limpiar y volver a pintar
                notesDiv.innerHTML = "";
                Array.from(existing).sort((a, b) => a - b).forEach(n => {
                    notesDiv.appendChild(createNoteSpan(n));
                });
            } else if (probeMode) {
                // MODO PRUEBA: todo en azul, sin contar errores
                // Si la celda ya tiene ese valor, lo borramos (toggle)
                if (currentPuzzle[i][j] === val) {
                    currentPuzzle[i][j] = 0;
                    input.value = "";
                    input.style.backgroundColor = "white";
                    notesDiv.innerHTML = "";
                } else {
                    currentPuzzle[i][j] = val;
                    notesDiv.innerHTML = ""; // BORRAR notas
                    input.value = renderSymbol(val);
                    input.style.backgroundColor = "#4169E1"; // Azul oscuro
                    playMusicalNote(val);
                    const probeResult = checkWin();
                    if (probeResult === "win") doWin();
                    else if (probeResult === "lose") doLose();
                }
            } else {
                // MODO NORMAL: poner número principal
                // Si la celda ya tiene ese valor, lo borramos (toggle)
                if (currentPuzzle[i][j] === val) {
                    currentPuzzle[i][j] = 0;
                    input.value = "";
                    input.style.backgroundColor = "white";
                    notesDiv.innerHTML = "";
                } else {
                    currentPuzzle[i][j] = val;
                    notesDiv.innerHTML = ""; // BORRAR notas
                    input.value = renderSymbol(val);

                    if (val !== solutionPuzzle[i][j]) {
                        input.style.backgroundColor = "#ff4d4d";
                        input.style.color = "white";
                        errorCount++;
                        document.getElementById("error-count").textContent = errorCount;
                    } else {
                        input.style.backgroundColor = "#c0e0c0";
                        input.style.color = "black";
                        // Reproducir nota musical si estamos en tema musical
                        playMusicalNote(val);
                    }

                    const normalResult = checkWin();
                    if (normalResult === "win") doWin();
                    else if (normalResult === "lose") doLose();
                }
            }
        });

        keypad.appendChild(btn);
    });
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

    // Reproducir música de victoria
    try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-01-01-12-02-11-victory.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => { /* si no se puede reproducir, continuar */ });
    } catch (e) { /* ignorar errores de audio */ }

    // Mensaje central con fondo blanco y PLAY AGAIN button
    let winMessage = document.getElementById("win-message");
    if (!winMessage) {
        winMessage = document.createElement("div");
        winMessage.id = "win-message";
        Object.assign(winMessage.style, {
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: "3em",
            color: "#ff6600",
            backgroundColor: "white",
            padding: "30px 40px",
            borderRadius: "10px",
            zIndex: "1000",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
        });
        
        // Agregar texto y botón
        const textDiv = document.createElement("div");
        textDiv.textContent = "🎉 GANASTE 🎉";
        winMessage.appendChild(textDiv);
        
        const playAgainBtn = document.createElement("button");
        playAgainBtn.textContent = "JUGAR DE NUEVO";
        Object.assign(playAgainBtn.style, {
            marginTop: "15px",
            padding: "8px 16px",
            fontSize: "0.9em",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
        });
        
        playAgainBtn.addEventListener("click", newSudoku);
        playAgainBtn.addEventListener("mouseover", () => {
            playAgainBtn.style.backgroundColor = "#45a049";
        });
        playAgainBtn.addEventListener("mouseout", () => {
            playAgainBtn.style.backgroundColor = "#4CAF50";
        });
        
        winMessage.appendChild(playAgainBtn);
        document.body.appendChild(winMessage);
        
    }

    // Crear muchos pollitos cayendo (15 pollitos con animación escalonada)
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const chick = document.createElement("div");
            chick.textContent = "🐤";
            Object.assign(chick.style, {
                position: "fixed",
                fontSize: "4em",
                zIndex: "999",
                userSelect: "none",
                pointerEvents: "none",
                animation: "chickFall 3s ease-in forwards"
            });
            
            // Posición aleatoria en la parte superior
            chick.style.left = Math.random() * 90 + 5 + "%";
            chick.style.top = "-10%";
            
            document.body.appendChild(chick);
        }, i * 150);
    }
    recordGame(true);
}

// Agregar animación CSS para los pollitos
const style = document.createElement("style");
style.textContent = `
    @keyframes chickFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Función de derrota
function doLose() {
    clearInterval(timer);
    
    // Reproducir música triste (sonido derrotista)
    try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-08-13-09-49-37-8505.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => { /* ignorar si no se puede reproducir */ });
    } catch (e) { /* ignorar errores de audio */ }

    // Mensaje de derrota
    let loseMessage = document.getElementById("lose-message");
    if (!loseMessage) {
        loseMessage = document.createElement("div");
        loseMessage.id = "lose-message";
        loseMessage.textContent = "😢 PERDISTE 😢";
        Object.assign(loseMessage.style, {
            position: "fixed",
            top: "35%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: "3em",
            color: "#ff0000",
            backgroundColor: "white",
            padding: "20px 40px",
            borderRadius: "10px",
            zIndex: "1000",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            animation: "sadBounce 0.8s ease-in-out"
        });
        document.body.appendChild(loseMessage);
    }

    // Caras tristes cayendo
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const sadFace = document.createElement("div");
            sadFace.textContent = "😢";
            Object.assign(sadFace.style, {
                position: "fixed",
                fontSize: "4em",
                zIndex: "999",
                userSelect: "none",
                pointerEvents: "none",
                animation: "sadFall 3s ease-in forwards",
                left: Math.random() * 90 + 5 + "%",
                top: "-10%"
            });
            document.body.appendChild(sadFace);
        }, i * 300);
    }
    recordGame(false);
}

// Agregar animaciones CSS para derrota
const loseStyle = document.createElement("style");
loseStyle.textContent = `
    @keyframes sadBounce {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    @keyframes sadFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(-360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(loseStyle);

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
    solutionPuzzle = full.map(row => row.slice()); // Guardar la solución completa
    currentPuzzle = removeNumbersSmart(full, currentLevel);
    originalPuzzle = currentPuzzle.map(row => row.slice()); // clon profundo
    // ocultar mensaje de victoria si existe
    const wm = document.getElementById("win-message");
    if (wm) wm.remove();
    displaySudoku(currentPuzzle);
    displayKeypad();
    startTimer();
}

function restartSudoku() {
    errorCount = 0;
    document.getElementById("error-count").textContent = errorCount;
    // restaurar copia
    currentPuzzle = originalPuzzle.map(row => row.slice());
    displaySudoku(currentPuzzle);
    displayKeypad();
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

// Botón Probar
const toggleProbeBtn = document.getElementById("toggle-probe");
if (toggleProbeBtn) toggleProbeBtn.addEventListener("click", function() {
    probeMode = !probeMode;
    this.textContent = probeMode ? "Probar ON" : "Probar OFF";
    this.classList.toggle("active", probeMode);
    
    // Si desactivamos el modo prueba, mostrar diálogo con dos opciones
    if (!probeMode) {
        // Recolectar celdas azules (probadas)
        const inputs = document.querySelectorAll(".cell input");
        const blueCells = [];
        inputs.forEach((input, idx) => {
            const row = Math.floor(idx / 9);
            const col = idx % 9;
            // Buscar celdas que tienen valor pero no están fijas
            if (input.value && input.style.backgroundColor !== "white" && input.style.backgroundColor !== "rgb(224, 224, 224)" && input.style.backgroundColor !== "#e0e0e0" && input.style.backgroundColor !== "") {
                const cellRow = parseInt(input.parentElement.dataset.row);
                const cellCol = parseInt(input.parentElement.dataset.col);
                blueCells.push({ row: cellRow, col: cellCol, input, value: currentPuzzle[cellRow][cellCol] });
            }
        });
        
        if (blueCells.length > 0) {
            // Crear diálogo con dos opciones
            const dialog = document.createElement("div");
            dialog.id = "probe-dialog";
            Object.assign(dialog.style, {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                zIndex: "2000",
                textAlign: "center",
                minWidth: "300px",
                border: "2px solid black"
            });
            
            dialog.innerHTML = `
                <p style="font-size: 1.2em; margin-bottom: 20px; color: #333; font-weight: bold;">¿Qué deseas hacer con lo probado?</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="keep-blue-btn" style="padding: 10px 20px; font-size: 1em; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 5px; font-weight: bold;">Conservar</button>
                    <button id="clear-blue-btn" style="padding: 10px 20px; font-size: 1em; cursor: pointer; background-color: #f44336; color: white; border: none; border-radius: 5px; font-weight: bold;">Borrar</button>
                </div>
            `;
            document.body.appendChild(dialog);
            
            // Opción 1: Conservar lo probado
            const keepBtn = document.getElementById("keep-blue-btn");
            keepBtn.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                let newErrors = 0;
                // Marcar celdas incorrectas en rojo, contar errores
                blueCells.forEach(({ row, col, input, value }) => {
                    if (value !== solutionPuzzle[row][col]) {
                        input.style.backgroundColor = "#ff4d4d"; // Rojo si es incorrecto
                        input.style.color = "white";
                        newErrors++;
                    } else {
                        input.style.backgroundColor = "#c0e0c0"; // Verde claro si es correcto
                    }
                });
                
                errorCount += newErrors;
                document.getElementById("error-count").textContent = errorCount;
                dialog.remove();
                
                // Verificar win/lose después de conservar
                const result = checkWin();
                if (result === "win") doWin();
                else if (result === "lose") doLose();
            });
            
            // Opción 2: Borrar lo probado
            const clearBtn = document.getElementById("clear-blue-btn");
            clearBtn.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Limpiar celdas azules
                blueCells.forEach(({ row, col, input }) => {
                    currentPuzzle[row][col] = 0;
                    input.value = "";
                    input.style.backgroundColor = "white";
                    // Limpiar notas
                    const notesDiv = input.parentElement.querySelector(".notes");
                    if (notesDiv) notesDiv.innerHTML = "";
                });
                dialog.remove();
            });
        }
    }
});

// theme selector (si existe)
const themeSel = document.getElementById("theme-select");
if (themeSel) {
    themeSel.addEventListener("change", function() {
        theme = this.value;
        displaySudoku(currentPuzzle);
        displayKeypad();
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
    let isComplete = true;
    let isCorrect = true;
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const v = currentPuzzle[i][j];
            if (!v) {
                isComplete = false;
            } else if (!checkCell(currentPuzzle, i, j, v)) {
                isCorrect = false;
            }
        }
    }
    
    // Si está completo pero incorrecto -> PERDISTE
    if (isComplete && !isCorrect) return "lose";
    // Si está completo y correcto -> GANASTE
    if (isComplete && isCorrect) return "win";
    // Si no está completo -> sigue jugando
    return false;
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

// abrir pagina de Estadisticas
const statsBtn = document.getElementById("btn-stats");
if (statsBtn) {
    statsBtn.addEventListener("click", () => {
        window.location.href = "statistics.html"; // abre nueva página
    });
}

// funcion para guardar las estadisticas en localStorage
function recordGame(won) {
    let gameHistory = JSON.parse(localStorage.getItem("sudokuStats")) || [];
    gameHistory.push({
        level: currentLevel,
        theme: theme,
        time: seconds,
        won: won,
        errors: errorCount,
        ts: Date.now()
    });
    localStorage.setItem("sudokuStats", JSON.stringify(gameHistory));
}
