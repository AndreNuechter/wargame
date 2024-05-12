// TODO impl game loop:
// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase

import { round_info } from './dom-selections';

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
        players,
        get current_player_id() {
            return current_player_id;
        },
        next_player() {
            current_player_id = Math.min(current_player_id + 1, players.length - 1);
            return current_player_id;
        },
        get current_phase() {
            return current_phase;
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
            // TODO iterate thru phases and players
            // TODO for starters...let players choose starting point or assign randomnly, according to event.target.landgrab-type... just assign randomly for now?
            console.log(13, current_phase, players);
            round_info.textContent = `${players[current_player_id].name} ${current_phase}`;
        }
    };
})();