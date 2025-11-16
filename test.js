<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Los Sudoku de Caro</title>

    <!-- Conectar el CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- Viewport (lo dejo porque no afecta a ordenador, pero no hay CSS móvil) -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>

<body>
    <h1>🔥 Los Sudoku de Caro 🔥</h1>

    <div id="timer">Tiempo: 00:00</div>

    <!-- ============================
         TEMÁTICAS (OPCIÓN B + D)
       ============================ -->
    <label for="theme-select"><strong>Temática:</strong></label>
    <select id="theme-select">
        <option value="classic">Clásico</option>
        <option value="braille">Braille</option>
        <option value="roman">Números Romanos</option>
        <option value="music">Notas Musicales</option>
        <option value="emoji">Emoji (🐶 Próximamente)</option>
        <option value="ascii">ASCII Art (★ Próximamente)</option>
    </select>

    <div id="sudoku-grid"></div>

    <p>
        <button id="new-game">Nuevo Sudoku</button>
        <button id="restart-game">Reiniciar Sudoku</button>
        <button id="toggle-notes">Notas OFF</button>
    </p>

    <script src="script.js"></script>

    <label for="difficulty"><strong>Dificultad:</strong></label>
    <select id="difficulty">
        <option>Fácil</option>
        <option>Medio</option>
        <option>Difícil</option>
        <option>Imposible</option>
    </select>

    <p>Errores: <span id="error-count">0</span></p>

</body>
</html>