import { player_setup } from './dom-selections.js';
import { player_config_tmpl } from './dom-creations.js';
import ROUND_PHASES from './round-phases.js';

const PLAYER_TYPES = {
    human: 'human',
    ai: 'ai'
};
// ea round consists of 3 phases: development, movement planning and movement execution phase
// development phase is used to develop owned cells/settlements and population thereof (see "age of exploration" android game)
// movement planning phase can be used to move population to adjacent cells
// movement execution phase enacts plans made in the phase before. conflicts between players may happen in this phase
// TODO impl me
const ROUND_ACTIONS = {
    [ROUND_PHASES.land_grab.name]: () => {
        // TODO randomnly pick an empty landbased tile, set its owner to this player and store a ref in this player.cell
    },
    [ROUND_PHASES.development.name]: () => {

    },
    [ROUND_PHASES.movement_planning.name]: () => {

    },
    [ROUND_PHASES.movement_execution.name]: () => {

    },
};

export function make_player_config(id) {
    const config = player_config_tmpl.cloneNode(true);

    Object.assign(
        config.querySelector('.player-name-input'),
        {
            name: `player-${id}-name`,
            value: `Player ${id}`
        }
    );
    config.querySelectorAll('.player-type-select-radio').forEach((radio) => {
        radio.name = `player-${id}-type`;
    });

    player_setup.append(config);
}

export default function create_player(name, type = PLAYER_TYPES.ai, color = '') {
    let player_name = name;

    return {
        get name() {
            return player_name;
        },
        set name(value) {
            if (value !== '') {
                player_name = value;
            }
        },
        take_turn(phase) {
            ROUND_ACTIONS[phase]();
        },
        color,
        type,
        cells: []
    };
}