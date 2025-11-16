// ------------------------------
// GENERADOR DE SUDOKU BÁSICO
// ------------------------------
function createEmptyBoard() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }

    let boxRow = Math.floor(row / 3) * 3;
    let boxCol = Math.floor(col / 3) * 3;

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[boxRow + r][boxCol + c] === num) return false;
        }
    }
    return true;
}

function solve(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solve(board)) return true;
                        board[row][col] = 0;
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
    let nums = [1,2,3,4,5,6,7,8,9];
    shuffleArray(nums);

    function solveRandom(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    shuffleArray(nums);
                    for (let n = 0; n < 9; n++) {
                        let num = nums[n];
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveRandom(board)) return true;
                            board[row][col] = 0;
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
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) positions.push([i,j]);
    }
    shuffleArray(positions);

    let removed = 0;
    for (let [row, col] of positions) {
        if (removed >= cellsToRemove) break;

        let rowCount = newBoard[row].filter(n => n !== 0).length;
        let colCount = newBoard.map(r => r[col]).filter(n => n !== 0).length;
        let boxRow = Math.floor(row / 3) * 3;
        let boxCol = Math.floor(col / 3) * 3;
        let boxCount = 0;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (newBoard[boxRow+r][boxCol+c] !== 0) boxCount++;
            }
        }

        if (rowCount > 3 && colCount > 3 && boxCount > 3) {
            newBoard[row][col] = 0;
            removed++;
        }
    }

    return newBoard;
}

// ------------------------------
// GESTIÓN DE ERRORES
// ------------------------------
let errorCount = 0;
let notesMode = false; // por defecto, modo notas desactivado

function checkCell(board, row, col, value) {
    value = parseInt(value);
    if (!value) return true;

    for (let i = 0; i < 9; i++) {
        if (i !== col && board[row][i] === value) return false;
        if (i !== row && board[i][col] === value) return false;
    }

    let boxRow = Math.floor(row / 3) * 3;
    let boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let rr = boxRow + r;
            let cc = boxCol + c;
            if ((rr !== row || cc !== col) && board[rr][cc] === value) return false;
        }
    }
    return true;
}

// ------------------------------
// Mostrar sudoku usando DIVS
// ------------------------------
function displaySudoku(board) {
    const grid = document.getElementById("sudoku-grid");
    grid.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;

            if (i % 3 === 0) cell.classList.add("border-top");
            if (i === 8) cell.classList.add("border-bottom");
            if (j % 3 === 0) cell.classList.add("border-left");
            if (j === 8) cell.classList.add("border-right");

            if (board[i][j] !== 0) {
                if (theme === "braille") {
                    cell.textContent = brailleMap[board[i][j]];
                } else {
                    cell.textContent = board[i][j];
                }
                cell.classList.add("fixed-cell");
            } else {
                let input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("maxlength", "1");
                input.style.boxSizing = "border-box";

                // div para notas pequeñas
                let notesDiv = document.createElement("div");
                notesDiv.classList.add("notes");
                cell.appendChild(notesDiv);

                input.addEventListener("input", function() {
                    this.value = this.value.replace(/[^1-9]/g, "");
                    let val = this.value ? parseInt(this.value) : 0;

                    if (notesMode) {
                        if (val) {
                            // obtener notas actuales como set
                            let notes = new Set();
                            notesDiv.querySelectorAll("span").forEach(s => notes.add(s.dataset.num ? parseInt(s.dataset.num) : parseInt(s.textContent)));
                            
                            // alternar la nota seleccionada
                            if (notes.has(val)) notes.delete(val);
                            else notes.add(val);

                            // vaciar notas y volver a crear los spans
                            notesDiv.innerHTML = ""; 

                            const positions = {
                                1: {top: "2%", left: "2%"},
                                2: {top: "2%", left: "40%"},
                                3: {top: "2%", left: "75%"},
                                4: {top: "40%", left: "2%"},
                                5: {top: "40%", left: "40%"},
                                6: {top: "40%", left: "75%"},
                                7: {top: "75%", left: "2%"},
                                8: {top: "75%", left: "40%"},
                                9: {top: "75%", left: "75%"}
                            };

                            Array.from(notes).sort().forEach(n => {
                                let span = document.createElement("span");
                                span.dataset.num = n;

                                // Mostrar Braille si el tema es Braille
                                if (theme === "braille") {
                                    span.textContent = brailleMap[n]; // usa tu objeto brailleMap definido previamente
                                } else {
                                    span.textContent = n;
                                }

                                // Posición fija
                                span.style.position = "absolute";
                                span.style.top = positions[n].top;
                                span.style.left = positions[n].left;

                                // Font size dependiendo del tema
                                span.style.fontSize = theme === "braille" ? "1em" : "1em";
                                notesDiv.appendChild(span);
                            });
                        }
                        this.value = ""; // no poner número principal en modo notas
                    } else {
                        // Modo normal: número principal
                        board[i][j] = val;
                        notesDiv.textContent = ""; // borrar notas al poner número

                        if (!checkCell(board, i, j, val)) {
                            this.style.backgroundColor = "#ff4d4d"; // rojo si hay error
                            errorCount++;
                            document.getElementById("error-count").textContent = errorCount;
                        } else {
                            this.style.backgroundColor = "#e0e0e0"; // gris si correcto
                        }

                        // Mostrar el número o símbolo según el tema
                        if (theme === "braille" && val) {
                            this.value = brailleMap[val];
                        } else {
                            this.value = val || "";
                        }
                    }

                    if(checkWin()){
                        clearInterval(timer);
                        confetti({
                            particleCount:150,
                            spread:70,
                            origin:{y:0.6}
                        });
                        const winMessage=document.createElement("div");
                        winMessage.id="win-message";
                        winMessage.textContent="🎉 GANASTE 🎉";
                        winMessage.style.position="fixed";
                        winMessage.style.top="40%";
                        winMessage.style.left="50%";
                        winMessage.style.transform="translate(-50%,-50%)";
                        winMessage.style.fontSize="3em";
                        winMessage.style.color="#ff6600";
                        winMessage.style.backgroundColor="white"; // <-- fondo blanco
                        winMessage.style.padding="20px 40px";      // <-- padding
                        winMessage.style.borderRadius="10px";      // <-- esquinas redondeadas
                        winMessage.style.zIndex="1000";
                        document.body.appendChild(winMessage);
                    }
                });

                cell.appendChild(input);
            }

            grid.appendChild(cell);
        }
    }
}


// ------------------------------
// NUEVO / REINICIAR SUDOKU
// ------------------------------
let currentPuzzle = [];         // puzzle con huecos
let originalPuzzle = [];        // clon del puzzle original para reinicio
let currentLevel = "Fácil";

function newSudoku() {
    errorCount = 0;
    document.getElementById("error-count").textContent = errorCount;

    currentLevel = document.getElementById("difficulty").value;
    const fullSudoku = generateFullSudoku();
    currentPuzzle = removeNumbersSmart(fullSudoku, currentLevel);

    // clon para reiniciar
    originalPuzzle = currentPuzzle.map(row => row.slice());

    displaySudoku(currentPuzzle);
    startTimer();
}

function restartSudoku() {
    errorCount = 0;
    document.getElementById("error-count").textContent = errorCount;

    // Usar el clon original para borrar inputs del jugador
    currentPuzzle = originalPuzzle.map(row => row.slice());
    displaySudoku(currentPuzzle);
    startTimer();
}

document.getElementById("new-game").addEventListener("click", newSudoku);
document.getElementById("restart-game").addEventListener("click", restartSudoku);
// Botón Notas
document.getElementById("toggle-notes").addEventListener("click", function() {
    notesMode = !notesMode;
    this.textContent = notesMode ? "Notas ON" : "Notas OFF";
    this.classList.toggle("active", notesMode);
});

// ------------------------------
// CONTADOR DE TIEMPO
// ------------------------------
let timer;
let seconds = 0;

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
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `Tiempo: ${min}:${sec}`;
}


function checkWin() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (currentPuzzle[i][j] === 0 || !checkCell(currentPuzzle, i, j, currentPuzzle[i][j])) {
                return false;
            }
        }
    }
    return true;
}


// ------------------------------
// TEMATICAS
// ------------------------------
let theme = "classic"; // tema por defecto

const themeSelect = document.getElementById("theme-select");
themeSelect.addEventListener("change", function() {
    theme = this.value;
    displaySudoku(currentPuzzle); // refresca la cuadrícula con el nuevo tema
});
const brailleMap = {
    1: "⠁", 2: "⠃", 3: "⠉",
    4: "⠙", 5: "⠑", 6: "⠋",
    7: "⠛", 8: "⠓", 9: "⠊"
};

// Escuchar cambios en el menú de temáticas
document.getElementById("theme-select").addEventListener("change", function() {
    theme = this.value;
    displaySudoku(currentPuzzle); // refrescar la cuadrícula con la nueva temática
});