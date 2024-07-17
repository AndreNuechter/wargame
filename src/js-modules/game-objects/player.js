import { player_setup } from '../dom-selections.js';
import { player_border_path, player_config_tmpl } from '../dom-creations.js';
import RESOURCES from './resources.js';
import outline_hexregion from '../hex-grid/outline-hexregion.js';

const PLAYER_TYPES = {
    human: 'human',
    ai: 'ai'
};

/** Create an UI element to config a player. */
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

/** Create a player. */
export default function make_player(id, name = 'Player Name', type = PLAYER_TYPES.ai) {
    const cells = [];
    const border_path = player_border_path.cloneNode(true);

    document.getElementById('player-borders').append(border_path);

    return {
        name,
        type,
        get resources() {
            return cells.reduce((result, { resources }) => {
                Object.entries(resources).forEach(([resource, amount]) => {
                    result[resource] += amount;
                });
                return result;
            }, {
                [RESOURCES.people]: 0,
                [RESOURCES.gold]: 0,
                [RESOURCES.cloth]: 0,
                [RESOURCES.wood]: 0,
                [RESOURCES.stone]: 0,
                [RESOURCES.iron]: 0,
                [RESOURCES.food]: 0,
                [RESOURCES.alcohol]: 0
            });
        },
        border_path_container: border_path,
        get cells() {
            return cells;
        },
        set cells(value) {
            cells.push(...value);
            outline_hexregion(cells, `var(--player-${id + 1})`, border_path);
        },
        encampments: new Map,
        destroy() {
            cells.length = 0;
            border_path.remove();
        }
    };
}