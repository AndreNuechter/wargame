import { player_setup } from './dom-selections.js';
import { player_config_tmpl } from './dom-creations.js';

const PLAYER_TYPES = {
    human: 'human',
    ai: 'ai'
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

export default function create_player(name, type = PLAYER_TYPES.ai, color) {
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
        color,
        type,
        cells: []
    };
}