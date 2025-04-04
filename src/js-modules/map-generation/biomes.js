import board_dimensions from '../game-objects/board/board-dimensions.js';
import HUMIDITY_LEVELS from './humidity-levels.js';
import RESOURCES from '../game-objects/resources.js';
import TEMPERATURES from './temperatures.js';

/** @type {Biomes} */
const BIOMES = {
    sea: make_biome('sea', { [RESOURCES.food]: 1 }),
    mountain: make_biome('mountain', {
        [RESOURCES.wood]: 2,
        [RESOURCES.stone]: 5,
        [RESOURCES.food]: 3,
    }),
    high_mountain: make_biome('high_mountain', {
        [RESOURCES.stone]: 5,
    }),
    ice: make_biome('ice', {
        [RESOURCES.food]: 2,
    }),
    tundra: make_biome('tundra', {
        [RESOURCES.wood]: 2,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 5,
    }),
    grassland: make_biome('grassland', {
        [RESOURCES.wood]: 2,
        [RESOURCES.stone]: 2,
        [RESOURCES.food]: 5,
    }),
    savanna: make_biome('savanna', {
        [RESOURCES.wood]: 5,
        [RESOURCES.stone]: 3,
        [RESOURCES.food]: 6,
    }),
    boreal_forest: make_biome('boreal_forest', {
        [RESOURCES.wood]: 10,
        [RESOURCES.stone]: 3,
        [RESOURCES.food]: 5,
    }),
    forest: make_biome('forest', {
        [RESOURCES.wood]: 10,
        [RESOURCES.stone]: 2,
        [RESOURCES.food]: 5,
    }),
    tropical_rainforest: make_biome('tropical_rainforest', {
        [RESOURCES.wood]: 7,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 5,
    }),
    cold_swamp: make_biome('cold_swamp', {
        [RESOURCES.wood]: 2,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 2,
    }),
    swamp: make_biome('swamp', {
        [RESOURCES.wood]: 1,
        [RESOURCES.stone]: 0,
        [RESOURCES.food]: 3,
    }),
    tropical_swamp: make_biome('tropical_swamp', {
        [RESOURCES.wood]: 3,
        [RESOURCES.stone]: 1,
        [RESOURCES.food]: 3,
    }),
    desert: make_biome('desert', {
        [RESOURCES.wood]: 0,
        [RESOURCES.stone]: 2,
        [RESOURCES.food]: 1,
    }),
    extreme_desert: make_biome('extreme_desert', {
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
export {
    assign_biomes,
    make_ice_and_sea,
};

/**
 * @param {Hex_Cell[]} hex_arr
 */
function assign_biomes(hex_arr) {
    hex_arr.forEach((hex) => {
        if (hex.biome) return;

        hex.biome = (() => {
            if (hex.elevation > 1) {
                if (hex.elevation > 2) return BIOMES.high_mountain;

                // TODO give mountains small chance to be volcano
                return BIOMES.mountain;
            }

            return biome_matrix[hex.temperature][hex.humidity];
        })();
    });
}

/** Create a biome object.
 * @param {Biome_Name} [name='sea']
 * @param {Gatherable_Resources} [resource_production={}]
 * @returns {Biome}
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
            [RESOURCES.wood]: 0,
            [RESOURCES.stone]: 0,
            [RESOURCES.food]: 0,
        }, resource_production),
    };
}

/**
 * @param {Hex_Cell[]} hex_arr
 */
function make_ice_and_sea(hex_arr) {
    hex_arr
        .filter(({ elevation }) => elevation === 0)
        .forEach((hex) => {
            hex.biome = pick_water_based_tile(hex);
        });
}

/**
 * @param {Hex_Cell} hex
 * @param {number} height
 * @returns {Biome}
 */
function pick_water_based_tile(hex, height = board_dimensions.height) {
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