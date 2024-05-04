import { player_setup } from './dom-selections.js';
import { player_config_tmpl } from './dom-creations.js';

const PLAYER_TYPES = {
    human: 'human',
    ai: 'ai'
};

function make_player_config(id, name) {
    const config = player_config_tmpl.cloneNode(true);

    // we need to use the first child as config is only a documentFragment
    config.children[0].dataset.playerId = id;

    Object.assign(
        config.querySelector('.player-name-input'),
        {
            name: `player-${id}-name`,
            value: name
        }
    );
    config.querySelectorAll('.player-type-select').forEach((radio) => {
        if (radio.value === PLAYER_TYPES.ai) {
            radio.checked = true;
        }
        radio.name = `player-${id}-type`;
    });

    return config;
}

export default function create_player(id, name) {
    // TODO prevent duplicate names?!
    let player_name = name || `Player ${id}`;

    player_setup.append(make_player_config(id, player_name));

    return {
        get name() {
            return player_name;
        },
        set name(value) {
            if (value !== '') {
                player_name = value;
            }
        },
        color: '',
        type: PLAYER_TYPES.ai,
        cells: []
    };
}