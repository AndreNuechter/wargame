import {
    bottom_bar,
    cell_info,
    cell_production_forecast,
    end_turn_btn,
    general_info,
    phase_label,
    player_name,
    selection_highlight,
    toggle_menu_btn
} from '../dom-selections.js';
import { setup_overall_production_forecast } from '../setup-sidebar-content.js';
import { calculate_resource_production, update_player_resources } from './resources.js';
import board from './board/board.js';
import players from './player.js';
import ROUND_PHASES from './round-phases/round-phases.js';
import { execute_moves } from './round-phases/movement-execution.js';

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
                    const winner_id = is_the_game_over_and_who_won();

                    if (winner_id >= 0) {
                        // ensure the finished game wont be saved
                        current_phase = ROUND_PHASES.game_over.name;
                        // TODO impl proper game end...congratulate winner, show stats/game summary
                        alert(`The World is Yours ${winner_id}`);
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

/** Return the id of the winner or -1 if there isn't one. */
function is_the_game_over_and_who_won() {
    // TODO check for other win conditions
    const remaining_players = players
        .filter(({ cells, encampments }) =>
            encampments.size > 0 ||
            cells.size > 0
        );

    if (remaining_players.length === 1) {
        return remaining_players[0].id;
    }

    return -1;
}

function adjust_ui() {
    // TODO add phase viz...string of dots representing phases, active is highlighted...
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
        moves = execute_moves(game);
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