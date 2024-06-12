import './js-modules/service-worker-init.js';
import './js-modules/wakelock.js';
import { create_hex_map, reroll_map } from './js-modules/hex-grid/hex-grid.js';
import board_dimensions from './js-modules/map-generation/board-dimensions.js';
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
    side_bar,
    start_game_form,
    start_game_overlay,
} from './js-modules/dom-selections.js';
import create_player, { make_player_config } from './js-modules/game-objects/player.js';
import game, { apply_savegame } from './js-modules/game-objects/game.js';
import ROUND_PHASES, { end_turn_btn_click_handling, side_bar_input_handling } from './js-modules/game-objects/round-phases.js';
import save_game from './js-modules/save-game.js';

// TODO add way to config map gen

// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase. at end of this phase: generate resources

// set up board
window.addEventListener('DOMContentLoaded', () => {
    const game_data = localStorage.getItem('wargame-savegame');
    const previously_saved_game = game_data !== null;

    start_game_overlay.dataset.priorSave = previously_saved_game;
    start_game_overlay.showModal();

    if (previously_saved_game) {
        apply_savegame(game, game_data);
    } else {
        game.board = create_hex_map(board_dimensions, game.board);
    }
}, { once: true });

window.addEventListener('beforeunload', save_game);

document.addEventListener('submit', (event) => event.preventDefault());

start_game_form.addEventListener('submit', (event) => {
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

end_turn_btn.addEventListener('click', end_turn_btn_click_handling(game));

config_game_form.addEventListener('submit', () => {
    // prevent duplicate names
    // TODO do this on input or change
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

    if (duplicate_names.size > 0) {
        // TODO add message below input and show toast
        // add highlight to related input field
        name_inputs.forEach((input) => {
            if (duplicate_names.has(input.value)) {
                input.classList.add('invalid');
            }
        });
        return;
    }

    // create player objects
    game.players = Array.from(
        player_configs,
        (config, id) => {
            const name = config.querySelector('.player-name-input').value;
            const type = config.querySelector('.player-type-select-radio:checked').value;
            return create_player(id, name, type);
        }
    );

    // TODO use other config options

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
    const cell_element = target.closest('.cell-wrapper');

    if (!cell_element) {
        return;
    }

    const previously_selected_cell = board.querySelector('.clicked');
    const hex_obj = game.board.get(cell_element);

    if (previously_selected_cell) {
        previously_selected_cell.classList.remove('clicked');
        // clear focus highlighting
        selection_highlight.replaceChildren();

        // player de-selected a cell
        if (previously_selected_cell === cell_element) return;
    }

    output_cell_info(hex_obj);

    ROUND_PHASES[game.current_phase].handler_function(hex_obj, cell_element, game);
});

side_bar.addEventListener('input', side_bar_input_handling(game));

document.querySelector('h1').addEventListener('dblclick', () => {
    document.body.classList.toggle('debug');
});

coord_system_toggle_btn.addEventListener('click', () => {
    document.body.classList.toggle('use-offset-coords');
});

function output_cell_info(hex_obj) {
    cell_info.textContent = JSON.stringify(
        hex_obj,
        // NOTE: `neighbors` is cyclic
        (key, value) => key === 'neighbors' ? undefined : value,
        4
    );
}