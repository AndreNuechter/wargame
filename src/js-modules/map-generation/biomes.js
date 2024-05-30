import board_dimensions from './board-dimensions.js';
import { TEMPERATURES } from './assign-temperature.js';
import { HUMIDITY_LEVELS } from './assign-humidity.js';

// for more see https://rimworldwiki.com/wiki/Biomes
// TODO balance resource production
export const BIOMES = {
    sea: new Biome('sea', { food: 1 }),
    mountain: new Biome('mountain', {
        wood: 2,
        stone: 5,
        food: 3,
    }),
    high_mountain: new Biome('high_mountain', {
        stone: 5
    }),
    ice: new Biome('ice', {
        food: 2,
    }),
    tundra: new Biome('tundra', {
        cloth: 1,
        wood: 2,
        stone: 1,
        food: 5,
    }),
    grassland: new Biome('grassland', {
        cloth: 3,
        wood: 2,
        stone: 2,
        food: 5,
    }),
    savanna: new Biome('savanna', {
        cloth: 5,
        wood: 5,
        stone: 3,
        food: 6,
    }),
    boreal_forest: new Biome('boreal_forest', {
        cloth: 4,
        wood: 10,
        stone: 3,
        food: 5,
    }), // taiga, should be most common
    forest: new Biome('forest', {
        cloth: 2,
        wood: 10,
        stone: 2,
        food: 5,
    }),
    tropical_rainforest: new Biome('tropical_rainforest', {
        cloth: 3,
        wood: 7,
        stone: 1,
        food: 5,
    }),
    cold_swamp: new Biome('cold_swamp', {
        cloth: 1,
        wood: 2,
        stone: 1,
        food: 2,
    }),
    swamp: new Biome('swamp', {
        cloth: 1,
        wood: 1,
        stone: 0,
        food: 3,
    }),
    tropical_swamp: new Biome('tropical_swamp', {
        cloth: 1,
        wood: 3,
        stone: 1,
        food: 3,
    }),
    desert: new Biome('desert', {
        cloth: 1,
        wood: 0,
        stone: 2,
        food: 1,
    }),
    extreme_desert: new Biome('extreme_desert', {
        cloth: 0,
        wood: 0,
        stone: 1,
        food: 0,
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

function Biome(
    name = '',
    resource_production = {},
    movement_speed = 1, // modify how fast work gets done here and how long it takes to traverse
    pleasantness = 1 // modify population growth (and maybe maintenance)...a way to make resource rich biomes less attractive
) {
    return {
        name,
        resource_production: Object.assign({
            gold: 0,
            cloth: 0,
            wood: 0,
            stone: 0,
            iron: 0,
            food: 0,
            alcohol: 0,
        }, resource_production),
        movement_speed,
        pleasantness
    };
}

export default function assign_biomes(hex_arr) {
    hex_arr.forEach((hex_obj) => {
        hex_obj.biome = pick_biome(hex_obj);
    });
}

export function create_ice_and_sea(hex_arr) {
    hex_arr
        .filter(({ elevation }) => elevation === 0)
        .forEach((hex) => {
            hex.biome = pick_water_based_tile(hex);
        });
}

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

function pick_biome(hex) {
    if (hex.biome) return hex.biome;

    if (hex.elevation > 1) {
        if (hex.elevation > 2) return BIOMES.high_mountain;
        // TODO give mountains small chance to be volcano?
        return BIOMES.mountain;
    }

    return biome_matrix[hex.temperature][hex.humidity];
}

// TODO find a better way to do this
const style_sheet = document.createElement('style');
style_sheet.textContent = Object.keys(BIOMES).map((name) =>
    `[data-biome="${name}"] {
        fill: var(--${name});
    }`
).join('\n');
document.body.append(style_sheet);