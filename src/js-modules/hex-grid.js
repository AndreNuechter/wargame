import compute_neighbors from './compute-neighbors.js';
import generate_landmasses from './map-generation/generate-landmasses.js';
import get_temperatures, { TEMPERATURES } from './map-generation/get-temperature.js';
import assign_biomes, { create_ice_and_sea } from './map-generation/biomes.js';
import assign_humidity, { HUMIDITY_LEVELS } from './map-generation/assign-humidity.js';
import { is_even } from './helper-functions.js';
import { create_hex_cell } from './hex-cell.js';

// clear previous config and create new map, while leaving the DOM intact
export function reroll_map(hex_map) {
    const hex_arr = [...hex_map.values()];

    hex_arr.forEach((hex_obj) => Object.assign(hex_obj, {
        biome: '',
        elevation: 0,
        humidity: HUMIDITY_LEVELS.arid,
        temperature: TEMPERATURES.freezing,
        owner_id: -1
    }));
    get_temperatures(hex_arr);
    generate_landmasses(hex_arr);
    create_ice_and_sea(hex_arr);
    assign_humidity(hex_arr);
    assign_biomes(hex_arr);

    return hex_map;
}

// recreate previous boardstate after reload
export function reinstate_hex_map(board_state, board_map) {
    const hex_arr = board_state
        .map(({
            cx, cy, x, y, q, r, s,
            biome,
            elevation,
            humidity,
            temperature,
            owner_id
        }) => Object.assign(
            create_hex_cell(cx, cy, x, y, q, r, s),
            {
                biome,
                elevation,
                humidity,
                temperature,
                owner_id
            }
        ));

    compute_neighbors(hex_arr);

    return hex_arr_to_map(hex_arr, board_map);
}

export function create_hex_map(board_dimensions, board_map) {
    // create hexgrid
    const hex_arr = create_hex_grid(board_dimensions);

    // compute neighbors
    compute_neighbors(hex_arr);
    // assign temperatures
    get_temperatures(hex_arr);
    // create landmasses
    generate_landmasses(hex_arr);
    // create waterbodies
    create_ice_and_sea(hex_arr);
    // assign humidity
    assign_humidity(hex_arr);
    // pick biome
    assign_biomes(hex_arr);

    return hex_arr_to_map(hex_arr, board_map);
}

function hex_arr_to_map(hex_arr, board_map) {
    // return map of svg-elements to hexes
    return hex_arr.reduce((map, hex) => {
        map.set(hex.cell, hex);
        return map;
    }, board_map);
}

function create_hex_grid({ height, width }) {
    const hex_grid = [];

    for (let row = 0; row < height; row += 1) {
        const odd_row = Number(!is_even(row));

        for (let col = 0; col < width; col += 1) {
            const q = col - (row - (row & 1)) / 2;

            hex_grid.push(create_hex_cell(
                (col * 6) + (odd_row * 3),
                row * 4.5,
                col,
                row,
                q,
                row,
                -q - row
            ));
        }
    }

    return hex_grid;
}