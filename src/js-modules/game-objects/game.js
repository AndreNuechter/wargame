import {
    bottom_bar,
    cell_info,
    cell_production_forecast,
    end_turn_btn,
    general_info,
    phase_label,
    player_name,
    selection_highlight
} from '../dom-selections.js';
import { setup_overall_production_forecast } from '../setup-sidebar-content.js';
import { calculate_resource_production } from './resources.js';
import { clear_move_queue } from './move-queue.js';
import board from './board/board.js';
import ROUND_PHASES from './round-phases/round-phases.js';
import { execute_moves } from './round-phases/movement-execution.js';

// TODO module for players
const players = [];
let round = 0;
let current_phase = ROUND_PHASES.land_grab.name;
let current_player_id = 0;
let current_player_total_production = null;
let moves;

// TODO if we could share this across files, finish this
/**
 * The god-object holding most of the game state.
 * @typedef {Object} game
 * @property {Map} board - A map from DOM/SVG hex-cells to the objects defining them.
 * @property {Number} round - A map from DOM/SVG hex-cells to the objects defining them.
 * @property {Object} active_player - Holds a reference to the player who has the turn.
 */
export default {
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
        selection_highlight.replaceChildren();

        // increase player_id and if returning to the beginning, move to the next phase
        if (current_player_id === players.length - 1) {
            current_player_id = 0;
            current_phase = (() => {
                switch (current_phase) {
                    case ROUND_PHASES.development.name:
                        clear_move_queue();
                        return ROUND_PHASES.movement_planning.name;
                    case ROUND_PHASES.movement_planning.name:
                        moves = execute_moves();
                        // in this phase we iterate over planned player_moves by season, not by player
                        current_player_id = players.length - 1;
                        return ROUND_PHASES.movement_execution.name;
                    default:
                        round += 1;
                        return ROUND_PHASES.development.name;
                }
            })();
        } else {
            current_player_id += 1;
        }

        adjust_ui();
    },
    run: adjust_ui
};

function adjust_ui() {
    // show phase specific end-turn-btn label
    end_turn_btn.textContent = ROUND_PHASES[current_phase].end_turn_btn_label;
    // show phase cta
    phase_label.textContent = ROUND_PHASES[current_phase].call_to_action;
    // show name of active player
    player_name.classList.remove('hidden');
    player_name.textContent = players[current_player_id].name;
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
            players[current_player_id].cells,
            players[current_player_id].tax_rate
        );
        cell_production_forecast.classList.add('hidden');
        setup_overall_production_forecast(
            calculate_resource_production(
                players[current_player_id].cells,
                players[current_player_id].tax_rate
            ),
            players[current_player_id].tax_rate
        );
        bottom_bar.classList.remove('content-hidden');
        update_resource_display();
    } else if (current_phase === ROUND_PHASES.movement_execution.name) {
        // hide player name
        player_name.classList.add('hidden');
    }
}

function update_resource_display() {
    bottom_bar.replaceChildren(
        ...Object.entries(players[current_player_id].resources).map(([name, value]) => {
            // TODO use icons instead of labels for resources
            return Object.assign(
                document.createElement('div'),
                { textContent: `${name}: ${value}` }
            );
        })
    );
}