import './js-modules/service-worker-init.js';
import Hex_grid from './js-modules/hex-grid.js';
import { board } from './js-modules/dom-selections.js';

// credits to https://www.redblobgames.com/grids/hexagons/

clear_board();
const board_dimensions = { width: 7, height: 8 };
const hex_map = new Hex_grid(board_dimensions);

document.getElementById('toogle-coord-system').addEventListener('click', () => {
    document.body.classList.toggle('use-offset-coords');
});

// highlight neighbors on click on cell
board.addEventListener('click', ({ target }) => {
    const cell_element = target.closest('.cell');

    if (!cell_element) return;

    const previously_selected_cell = document.querySelector('.clicked');

    if (previously_selected_cell) {
        previously_selected_cell.classList.remove('clicked');
        document.querySelectorAll('.adjacent-to-clicked').forEach(
            (cell) => cell.classList.remove('adjacent-to-clicked')
        );
    }

    cell_element.classList.add('clicked');
    hex_map.get(cell_element).neighbors.forEach(
        (cell) => cell.classList.add('adjacent-to-clicked')
    );
});

function clear_board() {
    board.innerHTML = '';
}