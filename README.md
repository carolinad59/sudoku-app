🎮 **Sudoku App**

A fully interactive Sudoku game built with HTML, CSS, and JavaScript.
Includes themes, notes mode, error tracking, difficulty levels, and mobile support.

✨ **Features**

🧩 **Sudoku Generation**

Generates a complete valid Sudoku board using backtracking.

Removes numbers intelligently depending on selected difficulty.

Ensures playable puzzles with balanced row/column/box clues.

🎨 **Themes**

- Choose how numbers are displayed:

- Classic (1–9)

- Braille

- Roman numerals

- Musical notes
Easily extendable by editing the ALPHABETS object.

✏️ **Notes Mode**

Toggle notes ON/OFF.

Add or remove small candidate numbers inside cells.

Notes update per-theme (e.g., Braille symbols).

❗ **Error Tracking**

Each incorrect entry increases the global error counter.

Incorrect numbers are highlighted in red.

Error counter persists even if the cell is corrected later.

📱 **Responsive Design**

Works on desktop browsers (Chrome, Firefox, Safari).

Optimized for iPhone and Android Safari/Chrome.

✔️ **Win Detection**

The app continuously validates the board.

When the puzzle is solved, a victory animation appears (with optional confetti).
