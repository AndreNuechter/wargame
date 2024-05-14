// TODO impl game loop:
// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase

import { round_info } from './dom-selections';
import { reinstate_hex_map } from './hex-grid';
import create_player from './player';

const ROUND_PHASES = {
    land_grab: 'land_grab',
    development: 'development',
    movement_planning: 'movement_planning',
    movement_execution: 'movement_execution'
};

export default (() => {
    const players = [];
    let current_phase = ROUND_PHASES.land_grab;
    let current_player_id = 0;

    return {
        board: new Map,
        round: 0,
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
        next_player() {
            current_player_id = Math.min(current_player_id + 1, players.length - 1);
            return current_player_id;
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
        increment_phase() {
            switch (current_phase) {
                case ROUND_PHASES.development:
                    current_phase = ROUND_PHASES.movement_planning;
                    break;
                case ROUND_PHASES.movement_planning:
                    current_phase = ROUND_PHASES.movement_execution;
                    break;
                default:
                    ROUND_PHASES.development;
            }
        },
        run() {
            // TODO for starters...let players choose starting point or assign randomnly, according to event.target.landgrab-type... just assign randomly for now?
            // TODO iterate thru phases and players, for exmpl...
            // for (const phase of ROUND_PHASES) {
            //     for (const player of players) {
            //         yield ROUND_ACTIONS[phase](player);
            //         if (game.is_over) return;
            //     }
            // }

            document.getElementById('round-label').textContent = current_phase;
            document.getElementById('player-name').textContent = players[current_player_id].name;
        }
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
}