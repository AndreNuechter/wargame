// TODO impl game loop:
// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase

const ROUND_PHASES = {
    land_grab: 'land_grab',
    development: 'development',
    movement_planning: 'movement_planning',
    movement_execution: 'movement_execution'
};

const game = {
    board: new Map,
    players: [],
    round: 0,
    current_player_id: -1,
    current_phase: ROUND_PHASES.landgrab
};

export default game;

function increment_phase(current_phase) {
    switch (current_phase) {
        case ROUND_PHASES.development:
            return ROUND_PHASES.movement_planning;
        case ROUND_PHASES.movement_planning:
            return ROUND_PHASES.movement_execution;
        default:
            ROUND_PHASES.development;
    }
}

function next_player(current_player_id) {
    return Math.min(current_player_id + 1, game.players.length -1);
}