import board_dimensions from './board-dimensions.js';
import TEMPERATURES from './temperatures.js';
import HUMIDITY_LEVELS from './humidity-levels.js';
import RESOURCES from '../game-objects/resources.js';

// TODO balance resource production
/** @type {Biomes} */
const BIOMES = {
    sea: make_biome('sea', { [RESOURCES.food]: 1 }),
    mountain: make_biome('mountain', {
        [RESOURCES.wood]: 2,
        [RESOURCES.stone]: 5,
        [RESOURCES.food]: 3,
    }),
    high_mountain: make_biome('high_mountain', {
        [RESOURCES.stone]: 5
    }),
    ice: make_biome('ice', {
        [RESOURCES.food]: 2,
    }),
    tundra: make_biome('tundra', {
        [RESOURCES.cloth]: 1,
        [RESOURCES.wood]: 2,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 5,
    }),
    grassland: make_biome('grassland', {
        [RESOURCES.cloth]: 3,
        [RESOURCES.wood]: 2,
        [RESOURCES.stone]: 2,
        [RESOURCES.food]: 5,
    }),
    savanna: make_biome('savanna', {
        [RESOURCES.cloth]: 5,
        [RESOURCES.wood]: 5,
        [RESOURCES.stone]: 3,
        [RESOURCES.food]: 6,
    }),
    boreal_forest: make_biome('boreal_forest', {
        [RESOURCES.cloth]: 4,
        [RESOURCES.wood]: 10,
        [RESOURCES.stone]: 3,
        [RESOURCES.food]: 5,
    }), // taiga, should be most common
    forest: make_biome('forest', {
        [RESOURCES.cloth]: 2,
        [RESOURCES.wood]: 10,
        [RESOURCES.stone]: 2,
        [RESOURCES.food]: 5,
    }),
    tropical_rainforest: make_biome('tropical_rainforest', {
        [RESOURCES.cloth]: 3,
        [RESOURCES.wood]: 7,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 5,
    }),
    cold_swamp: make_biome('cold_swamp', {
        [RESOURCES.cloth]: 1,
        [RESOURCES.wood]: 2,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 2,
    }),
    swamp: make_biome('swamp', {
        [RESOURCES.cloth]: 1,
        [RESOURCES.wood]: 1,
        [RESOURCES.stone]: 0,
        [RESOURCES.food]: 3,
    }),
    tropical_swamp: make_biome('tropical_swamp', {
        [RESOURCES.cloth]: 1,
        [RESOURCES.wood]: 3,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 3,
    }),
    desert: make_biome('desert', {
        [RESOURCES.cloth]: 1,
        [RESOURCES.wood]: 0,
        [RESOURCES.stone]: 2,
        [RESOURCES.food]: 1,
    }),
    extreme_desert: make_biome('extreme_desert', {
        [RESOURCES.cloth]: 0,
        [RESOURCES.wood]: 0,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 0,
    }),
};
const biome_matrix = {
    [TEMPERATURES.freezing]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.tundra,
        [HUMIDITY_LEVELS.dry]: BIOMES.tundra,
        [HUMIDITY_LEVELS.moderate]: BIOMES.tundra,
        [HUMIDITY_LEVELS.moist]: BIOMES.boreal_forest,
        [HUMIDITY_LEVELS.wet]: BIOMES.boreal_forest,
    },
    [TEMPERATURES.cold]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.tundra,
        [HUMIDITY_LEVELS.dry]: BIOMES.tundra,
        [HUMIDITY_LEVELS.moderate]: BIOMES.boreal_forest,
        [HUMIDITY_LEVELS.moist]: BIOMES.boreal_forest,
        [HUMIDITY_LEVELS.wet]: BIOMES.boreal_forest,
    },
    [TEMPERATURES.temperate]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.tundra,
        [HUMIDITY_LEVELS.dry]: BIOMES.forest,
        [HUMIDITY_LEVELS.moderate]: BIOMES.forest,
        [HUMIDITY_LEVELS.moist]: BIOMES.forest,
        [HUMIDITY_LEVELS.wet]: BIOMES.swamp,
    },
    [TEMPERATURES.warm]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.desert,
        [HUMIDITY_LEVELS.dry]: BIOMES.grassland,
        [HUMIDITY_LEVELS.moderate]: BIOMES.savanna,
        [HUMIDITY_LEVELS.moist]: BIOMES.forest,
        [HUMIDITY_LEVELS.wet]: BIOMES.tropical_swamp,
    },
    [TEMPERATURES.hot]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.extreme_desert,
        [HUMIDITY_LEVELS.dry]: BIOMES.desert,
        [HUMIDITY_LEVELS.moderate]: BIOMES.grassland,
        [HUMIDITY_LEVELS.moist]: BIOMES.savanna,
        [HUMIDITY_LEVELS.wet]: BIOMES.tropical_rainforest,
    },
};

export default BIOMES;

export { assign_biomes, make_ice_and_sea };

/** Create a biome object.
 * @param { Biome_Name } [name='sea']
 * @param {{}} [resource_production={}]
 * @returns { Biome }
 */
function make_biome(
    name = 'sea',
    resource_production = {},
    // movement_speed = 1, // modify how fast work gets done here and how long it takes to traverse
    // pleasantness = 1 // modify population growth (and maybe maintenance)...a way to make resource rich biomes less attractive...defendability might be another aspect
    // space available for building...
) {
    return {
        name,
        resource_production: Object.assign({
            [RESOURCES.gold]: 0,
            [RESOURCES.cloth]: 0,
            [RESOURCES.wood]: 0,
            [RESOURCES.stone]: 0,
            [RESOURCES.iron]: 0,
            [RESOURCES.food]: 0,
            [RESOURCES.alcohol]: 0,
        }, resource_production),
    };
}

function assign_biomes(hex_arr) {
    hex_arr.forEach((hex_obj) => {
        hex_obj.biome = pick_biome(hex_obj);
    });
}

function make_ice_and_sea(hex_arr) {
    hex_arr
        .filter(({ elevation }) => elevation === 0)
        .forEach((hex) => {
            hex.biome = pick_water_based_tile(hex);
        });
}

function pick_water_based_tile(hex, height = board_dimensions.height) {
    // TODO set developable land to 0 for sea
    // TODO set humidity based on temperature
    // TODO programmatically determine ranges
    const random_num = Math.random();

    // are we close to a pole
    // top and bottom row should be almost completely covered in ice
    if ([0, height - 1].includes(hex.y)) {
        if (random_num <= 0.1) {
            return BIOMES.sea;
        }

        return BIOMES.ice;
    }

    if ([1, height - 2].includes(hex.y)) {
        if (random_num <= 0.75) {
            return BIOMES.sea;
        }

        return BIOMES.ice;
    }

    if ([2, height - 3].includes(hex.y)) {
        if (random_num <= 0.9) {
            return BIOMES.sea;
        }

        return BIOMES.ice;
    }

    return BIOMES.sea;
}

function pick_biome(hex) {
    if (hex.biome) return hex.biome;

    if (hex.elevation > 1) {
        if (hex.elevation > 2) return BIOMES.high_mountain;
        // TODO give mountains small chance to be volcano?
        return BIOMES.mountain;
    }

    return biome_matrix[hex.temperature][hex.humidity];
}