import './js-modules/service-worker/service-worker-init.js';
import './js-modules/service-worker/wakelock.js';
import { reroll_map } from './js-modules/game-objects/board/hex-grid.js';
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
    main_overlay,
    toggle_menu_btn,
    troop_select_input,
    troop_select_output,
} from './js-modules/dom-selections.js';
import { make_player, make_player_config } from './js-modules/game-objects/player.js';
import game, { close_window, start_game } from './js-modules/game-objects/game.js';
import ROUND_PHASES, { end_turn_btn_click_handling } from './js-modules/game-objects/round-phases/round-phases.js';
import { plan_move } from './js-modules/game-objects/round-phases/movement-planning.js';
import { clear_move_queue } from './js-modules/game-objects/move-queue.js';
import { prevent_default_event_behavior } from './js-modules/helper-functions.js';
import { side_bar_input_handling } from './js-modules/setup-sidebar-content.js';

// TODO light theme toggle (in bottom of start_game_overlay)
// TODO divide sidebar content into chunks and make it swipable horizontally (use scroll snap...what on larger screens?)
// TODO in dev phase, empire overview, have list of owned cells w link to them
// TODO add a way to config map gen
// TODO use the following eslint rule? padding-line-between-statements

const min_player_count = 2;
const max_player_count = 5;

document.addEventListener('visibilitychange', close_window);
// all formdata will be handled client-side
document.addEventListener('submit', prevent_default_event_behavior);
document.querySelector('h1').addEventListener('dblclick', () => document.body.classList.toggle('debug'));
// zoom in or out
document.getElementById('zoom-btns').addEventListener('click', ({ target }) => {
    if (!(target instanceof Element)) return;

    const clicked_btn = target.closest('button');

    if (clicked_btn === null) return;

    const current_zoom_level = Number(board.dataset.zoom_level);

    if (clicked_btn.id === 'zoom-in') {
        if (current_zoom_level === 3) return;

        board.dataset.zoom_level = (current_zoom_level + 1).toString();
    } else {
        if (current_zoom_level === -1) return;

        board.dataset.zoom_level = (current_zoom_level - 1).toString();
    }
});
window.addEventListener('DOMContentLoaded', start_game, { once: true });
// display configured troop size after input
troop_select_input.addEventListener('input', () => {
    troop_select_output.value = troop_select_input.value;
});
// re-open main_overlay
toggle_menu_btn.addEventListener('click', () => {
    main_overlay.dataset.gameIsRunning = (
        game.current_phase !== ROUND_PHASES.game_over.name &&
        game.players.length > 0
    ).toString();
    main_overlay.showModal();
});
// player started or continued a game
start_game_form.addEventListener('submit', ({ submitter }) => {
    if (submitter.id === 'continue-btn') {
        // the continue-btn only works if there's a prior save/running game
        if (main_overlay.dataset.gameIsRunning === 'true') {
            main_overlay.close();
        }
    } else if (submitter.id === 'new-game-btn') {
        // if there's a prior save/running game or a game just finished, reroll the map, clear move_queue and delete players
        if (
            main_overlay.dataset.gameIsRunning === 'true' ||
            game.current_phase === ROUND_PHASES.game_over.name
        ) {
            Object.assign(game, {
                round: 0,
                current_phase: ROUND_PHASES.land_grab.name,
                current_player_id: 0
            });
            reroll_map(game.board);
            clear_move_queue();
            game.clear_players();

            // delete player creation ui elements to prevent duplicates and clear config
            for (const player_config of [...player_configs]) {
                player_config.remove();
            }
        }

        // create 2 player creation ui elements
        Array.from({ length: 2 }, (_, id) => make_player_config(id + 1));

        // switch to game-config
        main_overlay.classList.add('game-config');
    }
});
// player configured the game and pressed the start btn
config_game_form.addEventListener('submit', () => {
    // create players
    Array.from(player_configs, (player_config, id) => {
        const name = /** @type {HTMLInputElement} */ (player_config.querySelector('.player-name-input')).value;
        const type = /** @type {Player_Type} */ (/** @type {HTMLInputElement} */ (player_config.querySelector('.player-type-select-radio:checked')).value);

        game.players.push(make_player(id, name, type));
    });

    // TODO use other config options

    main_overlay.close();
});
// start the game when the dialog closes
// NOTE: we use this event to actually start the game, as swiping back on mobile closes the dialog no matter what
main_overlay.addEventListener('close', () => {
    // config a minimal viable game, if that's not yet the case
    if (game.players.length === 0) {
        game.players = Array.from(
            { length: 2 },
            (_, id) => make_player(id, `Player ${id + 1}`, 'human')
        );
    }

    // rm the class now (and thereby reset the form to its initial state) cuz we might get here wo submitting the config_game_form
    main_overlay.classList.remove('game-config');
    game.run();
});
reroll_map_btn.addEventListener('click', () => reroll_map(game.board));
add_player_btn.addEventListener('click', () => {
    if (player_configs.length === max_player_count) return;

    make_player_config(player_configs.length + 1);
});
end_turn_btn.addEventListener('click', end_turn_btn_click_handling(game));
// delete player
player_setup.addEventListener(
    'click',
    ({ target }) => {
        if (
            !(target instanceof HTMLElement || target instanceof SVGElement) ||
            target.closest('.delete-player-btn') === null ||
            player_configs.length === min_player_count
        ) return;

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
                    .forEach((/** @type {HTMLInputElement} */ radio) => {
                        radio.name = `player-${id}-type`;
                    });
            });
    });
// select a cell
board.addEventListener('click', ({ target }) => {
    const cell_element = /** @type {SVGGElement} */ (/** @type {Element} */ (target).closest('.cell-wrapper'));

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
coord_system_toggle_btn.addEventListener('click', () => document.body.classList.toggle('use-offset-coords'));

function output_cell_info(hex_obj) {
    cell_debug_info.textContent = JSON.stringify(
        hex_obj,
        // NOTE: `neighbors` is cyclic and therefore needs to be filtered out
        (key, value) => key === 'neighbors' ? undefined : value,
        4
    );
}