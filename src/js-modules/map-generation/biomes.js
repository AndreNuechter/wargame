import board_dimensions from '../board-dimensions.js';
import { TEMPERATURES } from './get-temperature.js';
import { HUMIDITY_LEVELS } from './assign-humidity.js';

// for more see https://rimworldwiki.com/wiki/Biomes
export const BIOMES = {
    sea: new Biome('sea'),
    mountain: new Biome('mountain'),
    high_mountain: new Biome('high_mountain'),
    ice: new Biome('ice'),
    tundra: new Biome('tundra'),
    grassland: new Biome('grassland'),
    savanna: new Biome('savanna'),
    boreal_forest: new Biome('boreal_forest'), // taiga, should be most common
    forest: new Biome('forest'),
    tropical_rainforest: new Biome('tropical_rainforest'),
    cold_swamp: new Biome('cold_swamp'),
    swamp: new Biome('swamp'),
    tropical_swamp: new Biome('tropical_swamp'),
    desert: new Biome('desert'),
    extreme_desert: new Biome('extreme_desert'),
};
const biome_matrix = {
    [TEMPERATURES.freezing]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.tundra.name,
        [HUMIDITY_LEVELS.dry]: BIOMES.tundra.name,
        [HUMIDITY_LEVELS.moderate]: BIOMES.tundra.name,
        [HUMIDITY_LEVELS.moist]: BIOMES.boreal_forest.name,
        [HUMIDITY_LEVELS.wet]: BIOMES.boreal_forest.name,
    },
    [TEMPERATURES.cold]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.tundra.name,
        [HUMIDITY_LEVELS.dry]: BIOMES.tundra.name,
        [HUMIDITY_LEVELS.moderate]: BIOMES.boreal_forest.name,
        [HUMIDITY_LEVELS.moist]: BIOMES.boreal_forest.name,
        [HUMIDITY_LEVELS.wet]: BIOMES.boreal_forest.name,
    },
    [TEMPERATURES.temperate]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.tundra.name,
        [HUMIDITY_LEVELS.dry]: BIOMES.forest.name,
        [HUMIDITY_LEVELS.moderate]: BIOMES.forest.name,
        [HUMIDITY_LEVELS.moist]: BIOMES.forest.name,
        [HUMIDITY_LEVELS.wet]: BIOMES.swamp.name,
    },
    [TEMPERATURES.warm]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.desert.name,
        [HUMIDITY_LEVELS.dry]: BIOMES.grassland.name,
        [HUMIDITY_LEVELS.moderate]: BIOMES.savanna.name,
        [HUMIDITY_LEVELS.moist]: BIOMES.forest.name,
        [HUMIDITY_LEVELS.wet]: BIOMES.tropical_swamp.name,
    },
    [TEMPERATURES.hot]: {
        [HUMIDITY_LEVELS.arid]: BIOMES.extreme_desert.name,
        [HUMIDITY_LEVELS.dry]: BIOMES.desert.name,
        [HUMIDITY_LEVELS.moderate]: BIOMES.grassland.name,
        [HUMIDITY_LEVELS.moist]: BIOMES.savanna.name,
        [HUMIDITY_LEVELS.wet]: BIOMES.tropical_rainforest.name,
    },
};

function Biome(name) {
    // TODO other properties, such as movement speed, ressource production...
    return { name };
}

export default function assign_biomes(hex_arr) {
    hex_arr.forEach((hex_obj) => {
        hex_obj.biome = pick_biome(hex_obj);
    });
}

export function create_ice_and_sea(hex_arr) {
    hex_arr.filter(({ elevation }) => elevation === 0)
        .forEach((hex) => {
            hex.biome = pick_water_based_tile(hex);
        });
}

function pick_water_based_tile(hex, height = board_dimensions.height) {
    // TODO programmatically determine ranges
    const random_num = Math.random();

    // are we close to a pole
    // top and bottom row should be almost completely covered in ice
    if ([0, height - 1].includes(hex.y)) {
        if (random_num <= 0.1) {
            return BIOMES.sea.name;
        }

        return BIOMES.ice.name;
    }

    if ([1, height - 2].includes(hex.y)) {
        if (random_num <= 0.75) {
            return BIOMES.sea.name;
        }

        return BIOMES.ice.name;
    }

    if ([2, height - 3].includes(hex.y)) {
        if (random_num <= 0.9) {
            return BIOMES.sea.name;
        }

        return BIOMES.ice.name;
    }

    return BIOMES.sea.name;
}

function pick_biome(hex) {
    if (hex.biome) return hex.biome;

    if (hex.elevation > 1) {
        if (hex.elevation > 2) return BIOMES.high_mountain.name;
        // TODO give mountains small chance to be volcano?
        return BIOMES.mountain.name;
    }

    return biome_matrix[hex.temperature][hex.humidity];
}

// TODO find a better way to do this
const styleSheet = window.document.styleSheets[0];
Object.values(BIOMES).forEach((biome) => {
    styleSheet.insertRule(
        `[data-biome="${biome.name}"] {
            .outer-cell:not(.owned),
            .inner-cell {
                fill: var(--${biome.name});
            }
        }`
    );
});