import './js-modules/service-worker-init.js';
import { board } from './js-modules/dom-selections.js';
import { create_hex_grid, render_hex_cell } from './js-modules/hex-cell.js';
import get_neighboring_cells from './js-modules/get-neighboring-cells.js';

// credits to https://www.redblobgames.com/grids/hexagons/

clear_board();
const board_dimensions = { width: 7, height: 8 };
// TODO mv this to a module
const hex_map = create_hex_grid(board_dimensions)
    .reduce((hex_cell_map, hex) => {
        hex_cell_map.set(render_hex_cell(hex), hex);
        return hex_cell_map;
    }, new Map());
// precompute neighbors
[...hex_map.values()].forEach((hex_obj) => {
    hex_obj.neighbors = get_neighboring_cells(hex_obj, [...hex_map], board_dimensions);
});

document.getElementById('toogle-coord-system').addEventListener('click', () => {
    document.body.classList.toggle('use-offset-coords');
});

// highlight neighbors on click
board.addEventListener('click', ({ target }) => {
    const cell_element = target.closest('.cell');

    if (!cell_element) return;

    const previously_selected_cell = document.querySelector('.clicked');

    if (previously_selected_cell) {
        previously_selected_cell.classList.remove('clicked');
        document.querySelectorAll('.adjacent-to-clicked').forEach((cell) => cell.classList.remove('adjacent-to-clicked'));
    }

    cell_element.classList.add('clicked');
    hex_map.get(cell_element).neighbors.forEach((cell) => cell.classList.add('adjacent-to-clicked'));
});

function clear_board() {
    board.innerHTML = '';
}