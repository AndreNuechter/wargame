import { board, player_setup } from '../dom-selections.js';
import { player_border_path, player_config_tmpl } from '../dom-creations.js';
import RESOURCES from './resources.js';
import outline_hexregion from '../hex-grid/outline-hexregion.js';

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

export default function create_player(id, name = 'Player Name', type = PLAYER_TYPES.ai) {
    const cells = [];
    const border_path_container = player_border_path.cloneNode(true);

    board.append(border_path_container);

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
        border_path_container,
        get cells() {
            return cells;
        },
        set cells(value) {
            cells.push(...value);
            outline_hexregion(cells, `var(--player-${id + 1})`, border_path_container);
        },
        destroy() {
            cells.length = 0;
            border_path_container.remove();
        }
    };
}

export function calculate_resource_production(cells, tax_rate = 1) {
    // TODO subtract food that's going to be used or decay
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
        total_population += cell.resources.people;

        // add default production
        Object.entries(cell.biome.resource_production).forEach(([resource, gain]) => {
            result[resource] += gain;
        });

        // add construction based production
        [...cell.structures.entries()].forEach(([structure, count]) => {
            // TODO overemployment...lower production if total pop. is lower than total structures required_workers
            structure.output.forEach(({ resource_name, amount }) => {
                result[resource_name] += amount * count;
            });
        });

        // calculate pop growth...this is not what we want to tell the player! that would be sth like expect sth between 0 and Math.floor(cell.resources.people / 2) * 2
        // TODO inc/dec pop growth based on how many neighboring cells are inhabited
        for (let pair_index = 0; pair_index < Math.floor(cell.resources.people / 2); pair_index += 1) {
            const random_num = Math.random();

            if (random_num < 0.3) {
                result[RESOURCES.people] += 2;
            } else if (random_num < 0.8) {
                result[RESOURCES.people] += 1;
            }
        }
    });

    // calculate gold/taxes
    // TODO homelessness...only housed pop helps w res production and can be used for war
    // TODO only employed population generates taxes!
    result[RESOURCES.gold] = total_population * tax_rate;

    return result;
}