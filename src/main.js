import './js-modules/service-worker-init.js';
import wakeLock from './js-modules/wakelock.js';
import { create_hex_map, reroll_map } from './js-modules/hex-grid.js';
import board_dimensions from './js-modules/board-dimensions.js';
import {
    add_player_btn,
    board,
    cell_info,
    config_game_form,
    coord_system_toggle_btn,
    player_configs,
    player_setup,
    reroll_map_btn,
    start_game_form,
    start_game_overlay,
} from './js-modules/dom-selections.js';
import create_player, { make_player_config } from './js-modules/player.js';
import game, { apply_savegame } from './js-modules/game.js';

// TODO add way to config map gen

// set up board
window.addEventListener('DOMContentLoaded', () => {
    const game_data = localStorage.getItem('wargame-savegame');
    const previously_saved_game = game_data !== null;

    start_game_overlay.dataset.priorSave = previously_saved_game;
    start_game_overlay.showModal();

    wakeLock.request();

    if (previously_saved_game) {
        apply_savegame(game, game_data);
    } else {
        game.board = create_hex_map(board_dimensions, game.board);
    }
}, { once: true });

// save game before closing page
window.addEventListener('beforeunload', () => {
    wakeLock.release();

    // dont save incomplete state (ie when closing page while still in the game_config_form)
    if (game.players.length === 0) {
        localStorage.removeItem('wargame-savegame');
        return;
    }

    localStorage.setItem(
        'wargame-savegame',
        JSON.stringify({
            round: game.round,
            current_phase: game.current_phase,
            current_player_id: game.current_player_id,
            players: game.players.map(({ name, type, color }) => ({ name, type, color })),
            board: [...game.board.values()]
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
                    owner: -1
                }))
        })
    );
});

// submit game_start overlay
start_game_form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (event.submitter.id === 'new-game-btn') {
        // if there's a prior save, reroll the map and delete players
        if (start_game_overlay.dataset.priorSave === 'true') {
            game.board = reroll_map(game.board);
            game.clear_players();
        }

        // create player creation ui elements
        Array.from({ length: 2 }, (_, id) => make_player_config(id + 1));

        // switch to game-config
        start_game_overlay.classList.add('game-config');
    } else {
        // continue game
        game.run();
        start_game_overlay.close();
    }
});

reroll_map_btn.addEventListener('click', () => {
    game.board = reroll_map(game.board);
});

config_game_form.addEventListener('submit', (event) => {
    event.preventDefault();
    // TODO use other config options
    // create player objects
    // TODO prevent duplicate player names
    game.players = Array.from(
        player_configs,
        (config) => {
            const name = config.querySelector('.player-name-input').value;
            const type = config.querySelector('.player-type-select-radio:checked').value;
            return create_player(name, type);
        }
    );
    // start game
    game.run();
    start_game_overlay.close();
});

add_player_btn.addEventListener('click', () => {
    // allow at max 5 players
    if (player_configs.length === 5) return;

    make_player_config(player_configs.length + 1);
});

// delete player
player_setup.addEventListener('click', ({ target }) => {
    if (!target.closest('.delete-player-btn')) return;
    // enforce a minimum of at least 2 players
    if (player_configs.length === 2) return;

    // rm config
    target.closest('.player-config').remove();
    // rewrite names etc on other player-configs
    [...player_configs]
        .forEach((config, id) => {
            id = id + 1;
            Object.assign(
                config.querySelector('.player-name-input'),
                {
                    name: `player-${id}-name`,
                    value: `Player ${id}`
                }
            );
            config.querySelectorAll('.player-type-select-radio')
                .forEach((radio) => {
                    radio.name = `player-${id}-type`;
                });
        });
});

// prevent closing dialog wo making a choice (ie by pressing esc)
start_game_overlay.addEventListener('cancel', (event) => event.preventDefault());

coord_system_toggle_btn.addEventListener('click', () => {
    document.body.classList.toggle('use-offset-coords');
});

// highlight neighboring cells on click
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

// show cell info on hover
board.addEventListener('pointerover', ({ target }) => {
    const cell_element = target.closest('.cell');

    if (!cell_element) return;

    const hex_obj = game.board.get(cell_element);

    cell_info.textContent = `
        biome: ${hex_obj.biome},
        temperature: ${hex_obj.temperature},
        humidity: ${hex_obj.humidity},
        elevation: ${hex_obj.elevation}
    `;
});