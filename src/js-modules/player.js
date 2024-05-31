import { board, player_setup } from './dom-selections.js';
import { player_border_path, player_config_tmpl } from './dom-creations.js';
import RESOURCES from './resources.js';
import STRUCTURES from './structures.js';
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
            [RESOURCES.people]: 5,
            [RESOURCES.gold]: 5,
            [RESOURCES.cloth]: 25,
            [RESOURCES.wood]: 25,
            [RESOURCES.stone]: 25,
            [RESOURCES.iron]: 0,
            [RESOURCES.food]: 50,
            [RESOURCES.alcohol]: 5
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

export function calculate_resource_production(cells, tax_rate = 1) {
    const result = {
        [RESOURCES.people]: 0,
        [RESOURCES.gold]: 0,
        [RESOURCES.cloth]: 0,
        [RESOURCES.wood]: 0,
        [RESOURCES.stone]: 0,
        [RESOURCES.iron]: 0,
        [RESOURCES.food]: 0,
        [RESOURCES.alcohol]: 0,
    };
    let total_population = 0;

    cells.forEach((cell) =>{
        total_population += cell.population;

        // add default production
        Object.entries(cell.biome.resource_production).forEach(([resource, gain]) => {
            result[resource] += gain;
        });

        // add construction based production
        Object.entries(cell.structures).forEach(([structure, count]) => {
            // TODO handle overemployment...lower production if the pop. of the cell is too low...structures have required_workers field, cells have population field...add up required_workers and determine how much percent of that we have...maybe its better to handle this overall, as the population might travel to go to work...
            Object.entries(STRUCTURES[structure].output).forEach(([resource, amount]) => {
                result[resource] += amount * count;
            });
        });

        // calculate pop growth...this is not what we want to tell the player! that would be sth like expect sth between 0 and Math.floor(cell.population / 2) * 2
        for (let pair_index = 0; pair_index < Math.floor(cell.population / 2); pair_index += 1) {
            const random_num = Math.random();

            if (random_num < 0.3) {
                result[RESOURCES.people] += 2;
            } else if (random_num < 0.8) {
                result[RESOURCES.people] += 1;
            }
        }
    });

    // calculate gold/taxes
    // TODO only employed population contributes!
    result[RESOURCES.gold] = total_population * tax_rate;

    return result;
}