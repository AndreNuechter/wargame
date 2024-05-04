import './js-modules/service-worker-init.js';
import { create_hex_map, reinstate_hex_map, reroll_map } from './js-modules/hex-grid.js';
import board_dimensions from './js-modules/board-dimensions.js';
import {
    add_player_btn,
    board,
    config_game_form,
    coord_system_toggle_btn,
    info_popover,
    player_setup,
    reroll_map_btn,
    start_game_form,
    start_game_overlay,
} from './js-modules/dom-selections.js';
import create_player from './js-modules/player.js';

// credits to https://www.redblobgames.com/grids/hexagons/

// TODO add way to config new game (player count [min 2], define player as human or ai, type of game start [see below], reroll map) and start game
// TODO on game start, let players choose starting point or assign randomnly
// TODO impl game loop:
// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase
// TODO add way to config map gen

const ROUND_PHASES = {
    land_grab: 'land_grab',
    development: 'development',
    movement_planning: 'movement_planning',
};
const game = {
    players: [],
    round: 0,
    phase: ROUND_PHASES.landgrab
};

// set up board
window.addEventListener('DOMContentLoaded', () => {
    const game_data = localStorage.getItem('wargame-board-state');
    const previously_saved_game = game_data !== null;

    start_game_overlay.dataset.priorSave = previously_saved_game;

    start_game_overlay.showModal();

    game.board = previously_saved_game
        ? reinstate_hex_map(game_data)
        : create_hex_map(board_dimensions);
}, { once: true });

// save game before closing page
window.addEventListener('beforeunload', () => {
    localStorage.setItem(
        'wargame-board-state',
        JSON.stringify([...game.board.values()]
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
                temperature,
                // TODO game and player data
            }))
        )
    );
});

// submit game_start overlay
start_game_form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (event.submitter.id === 'new-game-btn') {
        // if there's a prior save, reroll the map
        if (start_game_overlay.dataset.priorSave === 'true') {
            game.board = reroll_map(game.board);
        }

        // switch to game-config
        start_game_overlay.classList.add('game-config');

        game.players = Array.from({ length: 2 }, (_, id) => {
            create_player(id + 1);
        });
    } else {
        start_game_overlay.close();
    }
});

reroll_map_btn.addEventListener('click', () => {
    game.board = reroll_map(game.board);
});

config_game_form.addEventListener('submit', (event) => {
    event.preventDefault();
    // TODO check for valid config
    start_game_overlay.close();
});

add_player_btn.addEventListener('click', () => {
    if (game.players.length === 5) return;

    game.players.push(create_player(game.players.length + 1));
});

// delete player
player_setup.addEventListener('click', ({ target }) => {
    if (!target.closest('.delete-player-btn')) return;
    if (game.players.length === 2) return;

    const player_config = target.closest('.player-config');
    const player_id = Number(player_config.dataset.playerId) - 1;

    // rm player-obj
    game.players.splice(player_id, 1);
    // rm config
    player_config.remove();
    // rewrite names etc on other player-configs
    player_setup
        .querySelectorAll('.player-config')
        .forEach((config, id) => {
            id = id + 1;
            config.dataset.playerId = id;
            Object.assign(
                config.querySelector('.player-name-input'),
                {
                    name: `player-${id}-name`,
                    value: `Player ${id}`
                }
            );
            config.querySelectorAll('.player-type-select').forEach((radio) => {
                radio.name = `player-${id}-type`;
            });
        });
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
    const hex_obj = game.board.get(cell_element);

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

    const hex_obj = game.board.get(cell_element);

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