import {
    bottom_bar,
    cell_info,
    cell_production_forecast,
    end_turn_btn,
    general_info,
    main_overlay,
    phase_label,
    player_name,
    selection_highlight,
    toggle_menu_btn,
} from '../dom-selections.js';
import { calculate_resource_production, update_player_resources } from './resources.js';
import board, { reapply_board, save_board } from './board/board.js';
import players, { reapply_players, save_players } from './player.js';
import ROUND_PHASES from './round-phases/round-phases.js';
import { execute_moves } from './round-phases/movement-execution.js';
import storage_keys from './storage-keys.js';
import { reapply_move_queue, save_move_queue } from './move-queue.js';
import { make_hex_map } from './board/hex-grid.js';
import board_dimensions, { initialize_board_dimensions, save_board_dimensions } from './board/board-dimensions.js';
import setup_total_production_forecast from '../setup-total-production-forecast.js';

let round = 0;
let current_phase = ROUND_PHASES.land_grab.name;
let current_player_id = 0;
let current_player_total_production = null;
let moves;

/** @type {Game} */
const game = {
    board,
    get moves() {
        return moves;
    },
    get round() {
        return round;
    },
    set round(num) {
        round = num;
    },
    get active_player() {
        return players[current_player_id];
    },
    get players() {
        return players;
    },
    set players(values) {
        players.push(...values);
    },
    get current_player_id() {
        return current_player_id;
    },
    set current_player_id(id) {
        current_player_id = id;
    },
    get current_player_total_production() {
        return current_player_total_production;
    },
    clear_players() {
        players.forEach((player) => player.destroy());
        players.length = 0;
    },
    get current_phase() {
        return current_phase;
    },
    set current_phase(phase) {
        current_phase = phase;
    },
    update_resource_display: update_bottom_resource_display,
    next_turn() {
        // rm highlighting of clicked cells neighbors
        selection_highlight.setAttribute('d', '');

        // did we finish a phase?
        if (current_player_id < players.length - 1) {
            current_player_id += 1;
        } else {
            current_player_id = 0;
            current_phase = increment_phase();

            // did we finish a round?
            if (current_phase === ROUND_PHASES.development.name) {
                // dont update resources normally and check for win directly on start/after land_grab
                if (round > 0) {
                    const winner = is_the_game_over_and_who_won();

                    update_player_resources(players);

                    if (winner !== null) {
                        // ensure the finished game wont be saved
                        current_phase = ROUND_PHASES.game_over.name;
                        // visually disable continue btn
                        document.body.dataset.current_phase = ROUND_PHASES.game_over.name;
                        // TODO show stats/game summary
                        document.getElementById('winner-name').textContent = winner.name;
                        main_overlay.showModal();
                        toggle_menu_btn.click();

                        return;
                    }
                }

                round += 1;
            }
        }

        adjust_ui();
    },
    run: adjust_ui,
};

export default game;
export {
    continue_game_or_open_main_overlay,
    close_window,
    delete_savegame,
    save_game,
};

// TODO split apart and call in appropriate setter above
/** Configures the ui to current_phase and current_player. */
function adjust_ui() {
    // TODO add phase viz...string of dots representing phases, active is highlighted...
    // show phase specific end-turn-btn label
    end_turn_btn.textContent = ROUND_PHASES[current_phase].end_turn_btn_label;
    // show phase cta
    phase_label.textContent = ROUND_PHASES[current_phase].call_to_action;
    // hide or show name of active player
    player_name.classList.toggle('hidden', current_phase === ROUND_PHASES.movement_execution.name);
    // hide or show player resources
    bottom_bar.classList.toggle('content-hidden', current_phase !== ROUND_PHASES.development.name);
    // mark current phase in dom (to be used w css)
    document.body.dataset.current_phase = ROUND_PHASES[current_phase].name;
    // set player color
    document.documentElement.style.setProperty('--active-player-color', `var(--player-${current_player_id + 1}`);
    // output player name on top
    player_name.textContent = game.active_player.name;

    switch (current_phase) {
        case ROUND_PHASES.land_grab.name:
            // hide cell info and show general info
            cell_info.classList.add('hidden');
            general_info.classList.remove('hidden');
            break;
        case ROUND_PHASES.development.name:
            // calc total production
            current_player_total_production = calculate_resource_production(
                game.active_player.cells,
                game.active_player.tax_rate,
            );
            setup_total_production_forecast(
                current_player_total_production,
                game.active_player.tax_rate,
            );
            update_bottom_resource_display();
            // hide info panels for landgrab phase
            cell_production_forecast.classList.add('hidden');
            // show panels for this phase
            cell_info.classList.add('hidden');
            general_info.classList.add('hidden');
            break;
        case ROUND_PHASES.movement_execution.name:
            moves = execute_moves(game);
    }
}

/**
 * Apply the game state loaded from localStorage.
 * @param {string} game_data
 */
function apply_savegame(game_data) {
    const {
        round,
        current_phase,
        current_player_id,
    } = JSON.parse(game_data);

    Object.assign(game, {
        round,
        current_phase,
        current_player_id,
    });
}

/** Attempt to load game state from localStorage, initialize board_dimensions and continue game or open config. */
function continue_game_or_open_main_overlay() {
    const game_data = localStorage.getItem(storage_keys.game);
    const previously_saved_game = game_data !== null;

    main_overlay.dataset.gameIsRunning = previously_saved_game.toString();

    initialize_board_dimensions();

    if (previously_saved_game) {
        // there's a saved game, so we apply that and continue
        apply_savegame(game_data);
        reapply_board();
        reapply_players(game);
        reapply_move_queue(game);
        game.run();
    } else {
        // no prior game so we make a map and show the modal
        make_hex_map(game.board, board_dimensions);
        main_overlay.showModal();
    }
}

/** Delete or save data when the window could be closed. */
function close_window() {
    if (document.visibilityState !== 'hidden') return;

    // we dont want to save an incomplete state (ie when closing page while still in the game_config_form) and
    // we dont want to continue a finished game
    if (
        game.players.length === 0 ||
        game.current_phase === ROUND_PHASES.game_over.name
    ) {
        delete_savegame();
    } else {
        save_game();
        save_players();
        save_move_queue();
        save_board();
        save_board_dimensions();
    }
}

/** Delete every bit of game data. */
function delete_savegame() {
    Object.values(storage_keys)
        .forEach((key) => localStorage.removeItem(key));
}

// TODO clarify return type
/** Return the name of the phase following the current one.
 * @returns {string} "development" | "movement_planning" | "movement_execution"
*/
function increment_phase() {
    switch (current_phase) {
        case ROUND_PHASES.development.name:
            return ROUND_PHASES.movement_planning.name;
        case ROUND_PHASES.movement_planning.name:
            return ROUND_PHASES.movement_execution.name;
        case ROUND_PHASES.movement_execution.name:
        default:
            return ROUND_PHASES.development.name;
    }
}

/**
 * @returns {Player|null}
*/
function is_the_game_over_and_who_won() {
    // TODO check for other win conditions
    const remaining_players = players
        .filter(({ cells, encampments }) =>
            encampments.size > 0 ||
            cells.size > 0,
        );

    if (remaining_players.length === 1) {
        return remaining_players[0];
    }

    return null;
}

/** Store the game object to localStorage. */
function save_game() {
    localStorage.setItem(
        storage_keys.game,
        JSON.stringify({
            round: game.round,
            current_phase: game.current_phase,
            current_player_id: game.current_player_id,
        }),
    );
}

// TODO have the containers be static and just update the amount here
/** Adjust the botttom bar to show the resources of the current player. */
function update_bottom_resource_display() {
    bottom_bar.replaceChildren(
        ...Object.entries(game.active_player.resources)
            .map(([resource, amount]) => {
                return Object.assign(
                    document.createElement('div'),
                    {
                        title: resource,
                        innerHTML: `<svg class="icon"><use href="#${resource}"></use></svg>
                        <span>${amount}</span>`,
                    },
                );
            }),
    );
}