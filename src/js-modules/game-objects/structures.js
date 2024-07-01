import { BIOMES } from '../map-generation/biomes.js';
import RESOURCES from './resources.js';

// TODO finish this
const STRUCTURES = {
    tent: make_structure(
        'Tent',
        [
            make_resource_amount(RESOURCES.wood, 1),
            make_resource_amount(RESOURCES.cloth, 3),
        ],
        [],
        0,
        {
            // TODO housing should increase supported pop size ONCE...
            on(cell) {
                cell.housing_capacity += 5;
            },
            off(cell) {
                cell.housing_capacity -= 5;
            },
        },
        []
    ),
    textile_factory: make_structure(
        'Textile Factory',
        [
            make_resource_amount(RESOURCES.wood, 15),
            make_resource_amount(RESOURCES.stone, 15),
        ],
        [
            make_resource_amount(RESOURCES.cloth, 5),
        ]
    ),
    lumber_mill: make_structure('Lumber Mill',
        [
            make_resource_amount(RESOURCES.wood, 15),
            make_resource_amount(RESOURCES.stone, 15),
        ],
        [
            make_resource_amount(RESOURCES.wood, 5)
        ]
    ),
    quarry: make_structure('Quarry',
        [
            make_resource_amount(RESOURCES.wood, 15),
            make_resource_amount(RESOURCES.stone, 15),
        ],
        [
            make_resource_amount(RESOURCES.stone, 5),
        ]
    ),
    // TODO can we find another use? maybe coal used in forge, or chance of iron and gold?...
    // mine: make_structure('Mine',
    //     [
    //         make_resource_amount(RESOURCES.wood, 5),
    //         make_resource_amount(RESOURCES.stone, 5),
    //     ],
    //     [
    //         make_resource_amount(RESOURCES.stone, 5),
    //     ]
    // ),
    forge: make_structure('Forge',
        [
            make_resource_amount(RESOURCES.wood, 5),
            make_resource_amount(RESOURCES.stone, 5),
        ],
        [
            make_resource_amount(RESOURCES.iron, 1),
        ]
    ),
    farm: make_structure('Farm',
        [
            make_resource_amount(RESOURCES.wood, 5),
            make_resource_amount(RESOURCES.stone, 5),
        ],
        [
            make_resource_amount(RESOURCES.food, 5),
        ]
    ),
    distillery: make_structure('Distillery',
        [
            make_resource_amount(RESOURCES.wood, 5),
            make_resource_amount(RESOURCES.stone, 5),
        ],
        [
            make_resource_amount(RESOURCES.alcohol, 1),
        ]
    )
    // offensive (eg citadel, spy_academy...)/defensive structures (eg wall...), others like streets and storage, schools (see Banished, trade slower pop growth for higher productivity)...
};

export default STRUCTURES;

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
        }
    },
    unsupported_biomes = [BIOMES.swamp],
    input = [make_resource_amount(RESOURCES.wood, 1)],
    space_requirement = 1
) {
    return {
        display_name,
        construction_cost,
        space_requirement,
        unsupported_biomes,
        effects,
        output,
        input,
        required_workers
    };
}

function make_resource_amount(resource_name = RESOURCES.wood, amount = 1) {
    return {
        resource_name, amount
    };
}