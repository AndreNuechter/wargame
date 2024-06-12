import { reinstate_hex_map } from '../hex-grid/hex-grid.js';
import {
    bottom_bar, cell_production_forecast, end_turn_btn, overall_production_forecast, phase_label, player_name,
    selection_highlight
} from '../dom-selections.js';
import ROUND_PHASES from './round-phases.js';
import create_player, { calculate_resource_production } from './player.js';

const players = [];
let round = 0;
let current_phase = ROUND_PHASES.land_grab.name;
let current_player_id = 0;
let current_player_total_production = null;

export default {
    board: new Map,
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
                        return ROUND_PHASES.movement_planning.name;
                    case ROUND_PHASES.movement_planning.name:
                        return ROUND_PHASES.movement_execution.name;
                    default:
                        round += 1;
                        return ROUND_PHASES.development.name;
                }
            })();
        } else {
            current_player_id += 1;
        }

        adjust_ui_to_phase();
    },
    run: adjust_ui_to_phase
};

function adjust_ui_to_phase() {
    end_turn_btn.textContent = ROUND_PHASES[current_phase].end_turn_btn_label;
    phase_label.textContent = ROUND_PHASES[current_phase].call_to_action;
    player_name.textContent = players[current_player_id].name;
    document.documentElement.style.setProperty('--active-player-color', `var(--player-${current_player_id + 1}`);

    if (current_phase === ROUND_PHASES.development.name) {
        // show overall resource production
        current_player_total_production = calculate_resource_production(
            players[current_player_id].cells,
            players[current_player_id].tax_rate
        );
        cell_production_forecast.replaceChildren();
        overall_production_forecast
            .innerHTML = `
                <h2>Totall Output</h2>
                <ul>
                    ${Object.entries(current_player_total_production).map(([resource, value]) => `<li>${resource}: ${value}</li>`).join('')}
                </ul>
                <form>
                    <h2>Tax Rate</h2>
                    <input type="range" name="tax_rate">
                </form>
                `;
        bottom_bar.classList.remove('content-hidden');
        // TODO display population count(s) on cells
        update_resource_display();
    } else {
        bottom_bar.classList.add('content-hidden');
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

export function apply_savegame(game, game_data) {
    const previous_game = JSON.parse(game_data);

    Object.assign(game, {
        round: previous_game.round,
        current_phase: previous_game.current_phase,
        current_player_id: previous_game.current_player_id,
        players: previous_game.players.map(({ name, type }, id) => create_player(id, name, type)),
        board: reinstate_hex_map(previous_game.board, game.board)
    });

    // give players their cells
    game.players.forEach((player, id) => {
        player.cells = [...game.board.values()].filter((cell) => cell.owner_id === id);
    });
}