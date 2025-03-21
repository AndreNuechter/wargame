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
    toggle_menu_btn
} from '../dom-selections.js';
import { setup_overall_production_forecast } from '../setup-sidebar-content.js';
import { calculate_resource_production, update_player_resources } from './resources.js';
import board, { reapply_board, save_board } from './board/board.js';
import players, { reapply_players, save_players } from './player.js';
import ROUND_PHASES from './round-phases/round-phases.js';
import { execute_moves } from './round-phases/movement-execution.js';
import storage_keys from './storage-keys.js';
import { reapply_move_queue, save_move_queue } from './move-queue.js';
import { make_hex_map } from './board/hex-grid.js';
import board_dimensions from '../map-generation/board-dimensions.js';

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
    update_resource_display,
    next_turn() {
        // rm highlighting of clicked cells neighbors
        selection_highlight.setAttribute('d', '');

        // increase player_id or reset it and move to the next phase
        if (current_player_id === players.length - 1) {
            current_player_id = 0;
            current_phase = increment_phase();

            // did we finish a phase?
            if (current_phase === ROUND_PHASES.development.name) {
                // dont give resources (and check for win) after picking origin
                if (round > 0) {
                    const winner = is_the_game_over_and_who_won();

                    if (winner !== null) {
                        // ensure the finished game wont be saved
                        current_phase = ROUND_PHASES.game_over.name;
                        // TODO impl proper game end...congratulate winner, show stats/game summary
                        alert(`The World is Yours ${winner.name}`);
                        // visually disable continue btn
                        document.body.dataset.current_phase = ROUND_PHASES.game_over.name;
                        toggle_menu_btn.click();
                        return;
                    }

                    update_player_resources(players);
                }

                round += 1;
            }
        } else {
            current_player_id += 1;
        }

        adjust_ui();
    },
    run: adjust_ui
};

export default game;
export {
    close_window,
    delete_savegame,
    save_game,
    start_game
};

function adjust_ui() {
    // TODO add phase viz...string of dots representing phases, active is highlighted...
    // show phase specific end-turn-btn label
    end_turn_btn.textContent = ROUND_PHASES[current_phase].end_turn_btn_label;
    // show phase cta
    phase_label.textContent = ROUND_PHASES[current_phase].call_to_action;
    // show name of active player
    player_name.classList.remove('hidden');
    player_name.textContent = game.active_player.name;
    // mark current phase in dom (to be used w css)
    document.body.dataset.current_phase = ROUND_PHASES[current_phase].name;
    // set player color
    document.documentElement.style.setProperty('--active-player-color', `var(--player-${current_player_id + 1}`);
    // hide player resources
    bottom_bar.classList.add('content-hidden');

    if (current_phase === ROUND_PHASES.land_grab.name) {
        // hide cell info and show general info
        cell_info.classList.add('hidden');
        general_info.classList.remove('hidden');
    } else if (current_phase === ROUND_PHASES.development.name) {
        // hide info panels for landgrab phase
        cell_info.classList.add('hidden');
        general_info.classList.add('hidden');
        // show overall resource production
        current_player_total_production = calculate_resource_production(
            game.active_player.cells,
            game.active_player.tax_rate
        );
        cell_production_forecast.classList.add('hidden');
        setup_overall_production_forecast(
            calculate_resource_production(
                game.active_player.cells,
                game.active_player.tax_rate
            ),
            game.active_player.tax_rate
        );
        bottom_bar.classList.remove('content-hidden');
        update_resource_display();
    } else if (current_phase === ROUND_PHASES.movement_execution.name) {
        moves = execute_moves(game);
        // hide player name
        player_name.classList.add('hidden');
    }
}

function apply_savegame(game_data) {
    const {
        round,
        current_phase,
        current_player_id
    } = JSON.parse(game_data);

    Object.assign(game, {
        round,
        current_phase,
        current_player_id,
    });
}

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
        save_board();
        save_players();
        save_move_queue();
    }
}

function delete_savegame() {
    Object.values(storage_keys)
        .forEach((key) => localStorage.removeItem(key));
}

function increment_phase() {
    switch (current_phase) {
        case ROUND_PHASES.development.name:
            return ROUND_PHASES.movement_planning.name;
        case ROUND_PHASES.movement_planning.name:
            return ROUND_PHASES.movement_execution.name;
        default: case ROUND_PHASES.movement_execution.name:
            return ROUND_PHASES.development.name;
    }
}

/** Return the winner or null if there isn't one. */
function is_the_game_over_and_who_won() {
    // TODO check for other win conditions
    const remaining_players = players
        .filter(({ cells, encampments }) =>
            encampments.size > 0 ||
            cells.size > 0
        );

    if (remaining_players.length === 1) {
        return remaining_players[0];
    }

    return null;
}

function save_game() {
    localStorage.setItem(
        storage_keys.game,
        JSON.stringify({
            round: game.round,
            current_phase: game.current_phase,
            current_player_id: game.current_player_id,
        })
    );
}

function start_game() {
    const game_data = localStorage.getItem(storage_keys.game);
    const previously_saved_game = game_data !== null;

    main_overlay.dataset.gameIsRunning = previously_saved_game.toString();

    if (previously_saved_game) {
        apply_savegame(game_data);
        reapply_board();
        reapply_players(game);
        reapply_move_queue(game);
        game.run();
    } else {
        make_hex_map(board_dimensions, game.board);
        main_overlay.showModal();
    }
}

function update_resource_display() {
    bottom_bar.replaceChildren(
        ...Object
            .entries(game.active_player.resources)
            .map(([name, value]) => {
                return Object.assign(
                    document.createElement('div'),
                    {
                        title: name,
                        innerHTML: `<svg class="icon"><use href="#${name}"></use></svg>
                        <span>${value}</span>`
                    }
                );
            })
    );
}