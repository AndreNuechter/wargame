import { reinstate_hex_map } from './hex-grid.js';
import ROUND_PHASES from './round-phases.js';
import create_player from './player.js';

export default (() => {
    const players = [];
    let round = 0;
    let current_phase = ROUND_PHASES.land_grab.name;
    let current_player_id = 0;

    function set_up_phase() {
        adjust_ui_to_phase();
        prompt_player();
    }

    function adjust_ui_to_phase() {
        // TODO give end-turn-btn turn-specific label
        // TODO display a round based call to action
        document.getElementById('phase-label').textContent = ROUND_PHASES[current_phase].call_to_action;
        document.getElementById('player-name').textContent = players[current_player_id].name;
    }

    function prompt_player() {
        players[current_player_id].take_turn(current_phase);
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
            if (id > -1 && id < players.length) {
                current_player_id = id;
            }
        },
        clear_players() {
            players.length = 0;
        },
        get current_phase() {
            return current_phase;
        },
        set current_phase(phase) {
            if (phase in ROUND_PHASES) {
                current_phase = phase;
            }
        },
        next_turn() {
            if (current_player_id === players.length - 1) {
                round += 1;
                current_player_id = 0;
                current_phase = (() => {
                    switch (current_phase) {
                        case ROUND_PHASES.development.name:
                            return ROUND_PHASES.movement_planning.name;
                        case ROUND_PHASES.movement_planning.name:
                            return ROUND_PHASES.movement_execution.name;
                        default:
                            return ROUND_PHASES.development.name;
                    }
                })();
            } else {
                current_player_id += 1;
            }

            set_up_phase();
        },
        run: set_up_phase
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
        player.cells = [...game.board.values()].filter((cell) => cell.owner_id === id).map(({ cell }) => cell);
    });
}