import './js-modules/service-worker-init.js';
import './js-modules/wakelock.js';
import { make_hex_map, reroll_map } from './js-modules/game-objects/board/hex-grid.js';
import board_dimensions from './js-modules/map-generation/board-dimensions.js';
import {
    add_player_btn,
    board,
    cell_debug_info,
    config_game_form,
    coord_system_toggle_btn,
    end_turn_btn,
    movement_config,
    player_configs,
    player_setup,
    reroll_map_btn,
    selection_highlight,
    side_bar,
    start_game_form,
    start_game_overlay,
    troop_select_input,
    troop_select_output,
} from './js-modules/dom-selections.js';
import make_player, { make_player_config } from './js-modules/game-objects/player.js';
import game from './js-modules/game-objects/game.js';
import ROUND_PHASES, { end_turn_btn_click_handling } from './js-modules/game-objects/round-phases/round-phases.js';
import { plan_move } from './js-modules/game-objects/round-phases/movement-planning.js';
import { clear_move_queue, reapply_move_queue, save_move_queue } from './js-modules/game-objects/move-queue.js';
import save_game, { apply_savegame } from './js-modules/save-game.js';
import { prevent_default_event_behavior } from './js-modules/helper-functions.js';
import { side_bar_input_handling } from './js-modules/setup-sidebar-content.js';
import { reapply_board, save_board } from './js-modules/game-objects/board/board.js';

// TODO add way to config map gen

// set up board
window.addEventListener('DOMContentLoaded', () => {
    const game_data = localStorage.getItem('wargame-savegame');
    const previously_saved_game = game_data !== null;

    start_game_overlay.dataset.priorSave = previously_saved_game;
    start_game_overlay.showModal();

    if (previously_saved_game) {
        apply_savegame(game, game_data);
        reapply_board(game);
    } else {
        make_hex_map(board_dimensions, game.board);
    }

    reapply_move_queue(game);
}, { once: true });

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        save_game();
        save_board();
        save_move_queue();
    }
});

// all formdata will be handled client-side
document.addEventListener('submit', prevent_default_event_behavior);

troop_select_input.addEventListener('input', () => {
    troop_select_output.value = troop_select_input.value;
});

start_game_form.addEventListener('submit', (event) => {
    if (event.submitter.id === 'continue-btn') {
        // the continue-btn does nothing if there's no prior save
        if (start_game_overlay.dataset.priorSave === 'true') {
            start_game_overlay.close();
        }
    } else if (event.submitter.id === 'new-game-btn') {
        // if there's a prior save, reroll the map, delete players and clear move_queue
        if (start_game_overlay.dataset.priorSave === 'true') {
            Object.assign(game, {
                round: 0,
                current_phase: ROUND_PHASES.land_grab.name,
                current_player_id: 0
            });
            reroll_map(game.board);
            game.clear_players();
            clear_move_queue();
        }

        // create player creation ui elements
        Array.from({ length: 2 }, (_, id) => make_player_config(id + 1));

        // switch to game-config
        start_game_overlay.classList.add('game-config');
    }
});

// NOTE: we need this listener as swiping back on mobile closes the dialog
start_game_overlay.addEventListener('close', () => {
    if (game.players.length === 0) {
        game.players = Array.from(
            { length: 2 },
            (_, id) => make_player(id, `Player ${id + 1}`, 'human')
        );
    }

    game.run();
});

reroll_map_btn.addEventListener('click', () => reroll_map(game.board));

end_turn_btn.addEventListener('click', end_turn_btn_click_handling(game));

config_game_form.addEventListener('submit', () => {
    // prevent duplicate names
    // TODO do this on input or change
    const duplicate_names = new Set();
    const name_inputs = [...config_game_form.querySelectorAll('.player-name-input')];

    name_inputs
        .reduce((name_count, { value: name }) => {
            name_count[name] = name in name_count
                ? name_count[name] + 1
                : 1;

            if (name_count[name] > 1) {
                duplicate_names.add(name);
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
            return make_player(id, name, type);
        }
    );

    // TODO use other config options

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

board.addEventListener('click', ({ target }) => {
    const cell_element = target.closest('.cell-wrapper');

    if (!cell_element) return;

    const previously_clicked_cell = board.querySelector('.clicked');
    const hex_obj = game.board.get(cell_element);

    if (previously_clicked_cell) {
        previously_clicked_cell.classList.remove('clicked');
        // clear focus highlighting
        selection_highlight.replaceChildren();
    }

    // player de-selected a cell
    if (previously_clicked_cell !== cell_element) {
        cell_element.classList.add('clicked');
    }

    output_cell_info(hex_obj);

    ROUND_PHASES[game.current_phase].handle_click_on_cell(hex_obj, game);
});

side_bar.addEventListener('input', side_bar_input_handling(game));

movement_config.addEventListener('close', plan_move(game));
movement_config.addEventListener('submit', () => movement_config.close());

document.querySelector('h1').addEventListener(
    'dblclick',
    () => document.body.classList.toggle('debug')
);

coord_system_toggle_btn.addEventListener(
    'click',
    () => document.body.classList.toggle('use-offset-coords')
);

function output_cell_info(hex_obj) {
    cell_debug_info.textContent = JSON.stringify(
        hex_obj,
        // NOTE: `neighbors` is cyclic
        (key, value) => key === 'neighbors' ? undefined : value,
        4
    );
}