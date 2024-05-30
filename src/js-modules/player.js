import { board, player_setup } from './dom-selections.js';
import { player_border_path, player_config_tmpl } from './dom-creations.js';
import outline_hexregion from './hex-grid/outline-hexregion.js';

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
    const cells = [];
    const border_path_container = player_border_path.cloneNode(true);

    board.append(border_path_container);

    return {
        name,
        color,
        type,
        resources: {
            people: 5,
            gold: 5,
            cloth: 25,
            wood: 25,
            stone: 25,
            iron: 0,
            food: 50,
            alcohol: 5
        },
        border_path_container,
        get cells() {
            return cells;
        },
        set cells(value) {
            cells.push(...value);
            outline_hexregion(cells, color, border_path_container);
        },
        destroy() {
            cells.length = 0;
            border_path_container.remove();
        }
    };
}

export function calculate_resource_production(cells) {
    const result = {
        people: 0,
        gold: 0,
        cloth: 0,
        wood: 0,
        stone: 0,
        iron: 0,
        food: 0,
        alcohol: 0,
    };

    cells.forEach((cell) =>{
        // add default production
        Object.entries(cell.biome.resource_production).forEach(([resource_name, gain]) => {
            result[resource_name] += gain;
        });
        // TODO add construction based production
    });

    // TODO calculate pop growth
    // TODO calculate gold/taxes

    return result;
}