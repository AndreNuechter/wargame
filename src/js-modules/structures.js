import RESOURCES from './resources.js';

// TODO finish and use this
export default {
    simple_housing: make_structure(
        [
            make_resource_cost(RESOURCES.wood, 1),
            make_resource_cost(RESOURCES.cloth, 1),
        ],
        (cell) => {
            // housing should increase supported pop size ONCE...homelessness...only housed pop helps w res production or war
            cell.housing_capacity += 5;
        },
    ),
    textile_factory: make_structure(
        [
            make_resource_cost(RESOURCES.wood, 5),
            make_resource_cost(RESOURCES.stone, 5),
        ],
        (cell) => {}
    ),
    lumber_mill: make_structure(),
    quarry: make_structure(),
    mine: make_structure(),
    forge: make_structure(),
    farm: make_structure(),
    distillery: make_structure()
    // offensive (eg citadel, spy_academy...)/defensive structures (eg wall...)
};

function make_structure(
    resource_cost = [],
    effects = () => {},
    unsupported_biomes = [],
    output = [],
    required_workers = 1
) {
    return {
        resource_cost, unsupported_biomes, effects, output, required_workers
    };
}

function make_resource_cost(resource_name, amount) {
    return {
        resource_name, amount
    };
}

function make_resource_output(resource_name, amount) {
    return {
        resource_name, amount
    };
}