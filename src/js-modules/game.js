import { reinstate_hex_map } from './hex-grid.js';
import { end_turn_btn } from './dom-selections.js';
import ROUND_PHASES from './round-phases.js';
import create_player from './player.js';

export default (() => {
    const players = [];
    let round = 0;
    let current_phase = ROUND_PHASES.land_grab.name;
    let current_player_id = 0;

    function adjust_ui_to_phase() {
        end_turn_btn.textContent = ROUND_PHASES[current_phase].end_turn_btn_label;
        document.getElementById('phase-label').textContent = ROUND_PHASES[current_phase].call_to_action;
        document.getElementById('player-name').textContent = players[current_player_id].name;
    }

    return {
        board: new Map,
        get round() {
            return round;
        },
        set round(num) {
            round = num;
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
        next_turn() {
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
})();

export function apply_savegame(game, game_data) {
    const previous_game = JSON.parse(game_data);

    Object.assign(game, {
        round: previous_game.round,
        current_phase: previous_game.current_phase,
        current_player_id: previous_game.current_player_id,
        players: previous_game.players.map(({ name, type, color }) => create_player(name, type, color)),
        board: reinstate_hex_map(previous_game.board, game.board)
    });

    // give players their cells
    game.players.forEach((player, id) => {
        player.cells = [...game.board.values()].filter((cell) => cell.owner_id === id);
    });
}