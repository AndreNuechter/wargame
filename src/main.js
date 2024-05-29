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
    end_turn_btn,
    player_configs,
    player_setup,
    reroll_map_btn,
    selection_highlight,
    start_game_form,
    start_game_overlay,
} from './js-modules/dom-selections.js';
import create_player, { calculate_resource_production, make_player_config } from './js-modules/player.js';
import game, { apply_savegame } from './js-modules/game.js';
import ROUND_PHASES from './js-modules/round-phases.js';
import { BIOMES } from './js-modules/map-generation/biomes.js';
import outline_hexregion from './js-modules/outline-hexregion.js';

// TODO add way to config map gen

// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase. at end of this phase: generate resources

let start_position_candidate = null;

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
                    biome: { name },
                    elevation,
                    humidity,
                    temperature,
                    owner_id
                }) => ({
                    cx,
                    cy,
                    x,
                    y,
                    q,
                    r,
                    s,
                    biome_name: name,
                    elevation,
                    humidity,
                    temperature,
                    owner_id
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
            Object.assign(game, {
                round: 0,
                current_phase: ROUND_PHASES.land_grab.name,
                current_player_id: 0
            });
            game.board = reroll_map(game.board);
            game.clear_players();
        }

        // create player creation ui elements
        Array.from({ length: 2 }, (_, id) => make_player_config(id + 1));

        // switch to game-config
        start_game_overlay.classList.add('game-config');
    } else {
        // the continue-btn does nothing if there's no prior save
        if (start_game_overlay.dataset.priorSave === 'false') return;
        // continue game
        game.run();
        start_game_overlay.close();
    }
});

reroll_map_btn.addEventListener('click', () => {
    game.board = reroll_map(game.board);
});

end_turn_btn.addEventListener('click', () => {
    if (game.current_phase === ROUND_PHASES.land_grab.name) {
        // TODO let player know he needs to pick a non-sea starting position
        if (start_position_candidate === null) return;

        game.board.get(start_position_candidate).owner_id = game.current_player_id;
        game.players[game.current_player_id].cells = [game.board.get(start_position_candidate)];

        start_position_candidate = null;
    }

    game.next_turn();
});

config_game_form.addEventListener('submit', (event) => {
    event.preventDefault();
    // prevent duplicate names
    const duplicate_names = new Set();
    const name_inputs = [...config_game_form.querySelectorAll('.player-name-input')];

    name_inputs
        .reduce((name_count, { value }) => {
            name_count[value] = value in name_count
                ? name_count[value] + 1
                : 1;

            if (name_count[value] > 1) {
                duplicate_names.add(value);
            }

            return name_count;
        }, {});

    if (duplicate_names.size !== 0) {
        // TODO add message below input and show toast
        // add highlight to related input field
        // TODO do this on change
        name_inputs.forEach((input) => {
            if (duplicate_names.has(input.value)) {
                input.classList.add('invalid');
            }
        });
        return;
    }

    // TODO find better way to store colors
    const player_colors = ['tomato', 'rebeccapurple', 'gold', 'aquamarine', 'hotpink'];

    // create player objects
    game.players = Array.from(
        player_configs,
        (config, id) => {
            const name = config.querySelector('.player-name-input').value;
            const type = config.querySelector('.player-type-select-radio:checked').value;
            return create_player(name, type, player_colors[id]);
        }
    );

    // TODO use other config options

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

board.addEventListener('click', ({ target }) => {
    const cell_element = target.closest('.cell');

    if (!cell_element) return;

    const previously_selected_cell = board.querySelector('.clicked');
    const hex_obj = game.board.get(cell_element);

    if (previously_selected_cell) {
        previously_selected_cell.classList.remove('clicked');
        // clear focus highlighting
        selection_highlight.replaceChildren();

        start_position_candidate = null;

        // player de-selected a cell
        if (previously_selected_cell === cell_element) return;
    }

    // highlight clicked cell and its neighbors
    cell_element.classList.add('clicked');
    outline_hexregion([...hex_obj.neighbors, hex_obj], 'white', selection_highlight);

    let text_to_display = '';

    if (game.current_phase === ROUND_PHASES.land_grab.name) {
        if (hex_obj.owner_id === -1 && hex_obj.biome !== BIOMES.sea) {
            start_position_candidate = cell_element;
        }
        text_to_display = `
                biome: ${hex_obj.biome.name},
                temperature: ${hex_obj.temperature},
                humidity: ${hex_obj.humidity},
                elevation: ${hex_obj.elevation}
            `;
    } else if (game.current_phase === ROUND_PHASES.development.name) {
        if (hex_obj.owner_id !== game.current_player_id) {
            // TODO show calculated values
            text_to_display = `in total you will gain ${ JSON.stringify(
                calculate_resource_production(game.players[game.current_player_id].cells)
            )}`;
        } else {
            text_to_display = `expect ${JSON.stringify(calculate_resource_production([hex_obj]))} from this cell`;
        }

        // TODO enable building/expanding constructions in owned cell (when selected, and adjust production forecast)
        // TODO enable turning population into soldiers
        // TODO enable raising/lowering taxes & planing events (to lower chance of pop revolting over taxes)
    }

    cell_info.textContent = text_to_display;
});

coord_system_toggle_btn.addEventListener('click', () => {
    document.body.classList.toggle('use-offset-coords');
});