import BIOMES from '../map-generation/biomes.js';
import RESOURCES from './resources.js';

// TODO finish this...required workers, input, unsupported biomes, space-req, effects
// TODO add more structures...offensive (eg citadel, spy_academy...)/defensive structures (eg wall...), others like streets and storage, schools (see Banished, trade slower pop growth for higher productivity)...
/** @type {Structures} */
const STRUCTURES = {
    tent: make_structure(
        'Tent',
        [
            make_resource_amount(RESOURCES.wood, 1),
        ],
        [],
        0,
        {
            // TODO use this...housing should increase supported pop size ONCE...
            on(cell) {
                cell.housing_capacity += 5;
            },
            off(cell) {
                cell.housing_capacity -= 5;
            },
        },
        new Set,
    ),
    lumber_mill: make_structure(
        'Lumber Mill',
        [
            make_resource_amount(RESOURCES.wood, 15),
            make_resource_amount(RESOURCES.stone, 15),
        ],
        [
            make_resource_amount(RESOURCES.wood, 5),
        ],
    ),
    quarry: make_structure(
        'Quarry',
        [
            make_resource_amount(RESOURCES.wood, 15),
            make_resource_amount(RESOURCES.stone, 15),
        ],
        [
            make_resource_amount(RESOURCES.stone, 5),
        ],
    ),
    mine: make_structure(
        'Mine',
        [
            make_resource_amount(RESOURCES.wood, 5),
            make_resource_amount(RESOURCES.stone, 5),
        ],
        [
            make_resource_amount(RESOURCES.coal, 5),
        ],
    ),
    forge: make_structure(
        'Forge',
        [
            make_resource_amount(RESOURCES.wood, 5),
            make_resource_amount(RESOURCES.stone, 5),
        ],
        [
            make_resource_amount(RESOURCES.iron, 1),
        ],
    ),
    farm: make_structure(
        'Farm',
        [
            make_resource_amount(RESOURCES.wood, 5),
            make_resource_amount(RESOURCES.stone, 5),
        ],
        [
            make_resource_amount(RESOURCES.food, 5),
        ],
    ),
    distillery: make_structure(
        'Distillery',
        [
            make_resource_amount(RESOURCES.wood, 5),
            make_resource_amount(RESOURCES.stone, 5),
        ],
        [
            make_resource_amount(RESOURCES.alcohol, 1),
        ],
    ),
};

export default STRUCTURES;

/**
 * @param { string } display_name
 * @param { Resource_Amount[] } construction_cost
 * @param { Resource_Amount [] } output
 * @param { number } required_workers
 * @param { object } effects
 * @param { Set<Biome> } unsupported_biomes
 * @param { Resource_Amount[] } input
 * @param { number } space_requirement
 * @returns { Structure }
 */
function make_structure(
    display_name = 'Pretty Structure',
    construction_cost = [make_resource_amount(RESOURCES.wood, 5)],
    output = [make_resource_amount(RESOURCES.wood, 1)],
    required_workers = 1,
    effects = {
        on(cell) {
            cell.foo += 5;
        },
        off(cell) {
            cell.foo -= 5;
        },
    },
    unsupported_biomes = new Set([BIOMES.swamp]),
    input = [make_resource_amount(RESOURCES.wood, 1)],
    space_requirement = 1,
) {
    return {
        display_name,
        construction_cost,
        space_requirement,
        unsupported_biomes,
        effects,
        output,
        input,
        required_workers,
    };
}

/**
 * @param { Resource } resource_name
 * @param { number } amount
 * @returns { Resource_Amount }
 */
function make_resource_amount(resource_name = RESOURCES.wood, amount = 1) {
    return { resource_name, amount };
}