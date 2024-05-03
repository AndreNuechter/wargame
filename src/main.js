import './js-modules/service-worker-init.js';
import { create_hex_map, reinstate_hex_map, reroll_map } from './js-modules/hex-grid.js';
import board_dimensions from './js-modules/board-dimensions.js';
import {
    board, info_popover, coord_system_toggle_btn, start_game_overlay, start_game_form
} from './js-modules/dom-selections.js';

// credits to https://www.redblobgames.com/grids/hexagons/

// TODO add way to config new game (player count [min 2], define player as human or ai, type of game start [see below], reroll map) and start game
// TODO on game start, let players choose starting point or assign randomnly
// TODO impl game loop:
// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase
// TODO add way to config map gen

let hex_map;

// set up board
window.addEventListener('DOMContentLoaded', () => {
    const game_data = localStorage.getItem('wargame-board-state');
    const previously_saved_game = game_data !== null;

    start_game_overlay.dataset.priorSave = previously_saved_game;

    start_game_overlay.showModal();

    hex_map = previously_saved_game
        ? reinstate_hex_map(game_data)
        : create_hex_map(board_dimensions);
}, { once: true });

// save game before closing page
window.addEventListener('beforeunload', () => {
    localStorage.setItem(
        'wargame-board-state',
        JSON.stringify([...hex_map
            .values()]
            .map(({
                cx, cy, x, y, q, r, s,
                biome,
                elevation,
                humidity,
                temperature
            }) => ({
                cx,
                cy,
                x,
                y,
                q,
                r,
                s,
                biome,
                elevation,
                humidity,
                temperature
            }))
        )
    );
});

// submit game_start overlay
start_game_form.addEventListener('submit', (event) => {
    event.preventDefault();

    // pressing new-game-btn, when there's a prior save, rerolls the map
    if (event.submitter.id === 'new-game-btn' && start_game_overlay.dataset.priorSave === 'true') {
        hex_map = reroll_map(hex_map);
    }

    start_game_overlay.close();
});

// prevent closing dialog wo making a choice (ie pressing esc)
start_game_overlay.addEventListener('cancel', (event) => event.preventDefault());

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