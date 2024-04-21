import './js-modules/service-worker-init.js';
import Hex_grid from './js-modules/hex-grid.js';
import board_dimensions from './js-modules/board-dimensions.js';
import { board, info_popover, coord_system_toggle_btn } from './js-modules/dom-selections.js';

// credits to https://www.redblobgames.com/grids/hexagons/

const hex_map = new Hex_grid(board_dimensions);

coord_system_toggle_btn.addEventListener('click', () => {
    document.body.classList.toggle('use-offset-coords');
});

// highlight neighbors on click on cell
board.addEventListener('click', ({ target }) => {
    const cell_element = target.closest('.cell');

    if (!cell_element) return;

    const previously_selected_cell = board.querySelector('.clicked');
    const hex_obj = hex_map.get(cell_element);

    if (previously_selected_cell) {
        previously_selected_cell.classList.remove('clicked');
        board.querySelectorAll('.adjacent-to-clicked').forEach(
            (cell) => cell.classList.remove('adjacent-to-clicked')
        );

        if (previously_selected_cell === cell_element) return;
    }

    cell_element.classList.add('clicked');
    hex_obj.neighbors.forEach(
        ({ cell }) => cell.classList.add('adjacent-to-clicked')
    );
});

// show info popover on hover
board.addEventListener('pointerover', ({ target, x, y }) => {
    const cell_element = target.closest('.cell');

    if (!cell_element) return;

    const hex_obj = hex_map.get(cell_element);

    info_popover.textContent = `
        biome: ${hex_obj.biome},
        temperature: ${hex_obj.temperature},
        humidity: ${hex_obj.humidity},
        elevation: ${hex_obj.elevation}
    `;
    info_popover.classList.add('visible');
    info_popover.style.top = `${y}px`;
    info_popover.style.left = `${x}px`;
});