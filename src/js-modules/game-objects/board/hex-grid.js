import compute_neighbors from './compute-neighbors.js';
import generate_landmasses from '../../map-generation/generate-landmasses.js';
import assign_temperatures, { TEMPERATURES } from '../../map-generation/assign-temperature.js';
import assign_biomes, { BIOMES, make_ice_and_sea } from '../../map-generation/biomes.js';
import assign_humidity, { HUMIDITY_LEVELS } from '../../map-generation/assign-humidity.js';
import { is_even } from '../../helper-functions.js';
import { make_hex_cell } from './hex-cell.js';

/** Clear previous config and create new map, while leaving the DOM intact */
export function reroll_map(hex_map) {
    const hex_arr = [...hex_map.values()];

    hex_arr.forEach((hex_obj) => Object.assign(hex_obj, {
        biome: null,
        elevation: 0,
        humidity: HUMIDITY_LEVELS.arid,
        temperature: TEMPERATURES.freezing,
        resources: Object.keys(hex_obj.resources).reduce((result, resource_name) => {
            result[resource_name] = 0;
            return result;
        }, hex_obj.resources),
        owner_id: -1
    }));
    assign_temperatures(hex_arr);
    generate_landmasses(hex_arr);
    make_ice_and_sea(hex_arr);
    assign_humidity(hex_arr);
    assign_biomes(hex_arr);

    return hex_map;
}

/** Recreate previous boardstate after reload. */
export function reinstate_hex_map(board_state, board_map) {
    const hex_arr = board_state
        .map(({
            cx, cy, x, y, q, r, s,
            biome_name,
            elevation,
            humidity,
            temperature,
            owner_id,
            resources
        }) => {
            const hex_cell = make_hex_cell(cx, cy, x, y, q, r, s);

            Object.assign(
                hex_cell,
                {
                    biome: BIOMES[biome_name],
                    elevation,
                    humidity,
                    temperature,
                    owner_id,
                }
            );
            // assigning resources directly above would overwrite the setter/getter on resources.people
            Object.entries(resources).forEach(([resource, value]) => {
                hex_cell.resources[resource] = value;
            });

            return hex_cell;
        });

    compute_neighbors(hex_arr);
    hex_arr_to_map(hex_arr, board_map);
}

export function make_hex_map(board_dimensions, board_map) {
    const hex_arr = make_hex_grid(board_dimensions);

    compute_neighbors(hex_arr);
    assign_temperatures(hex_arr);
    generate_landmasses(hex_arr);
    make_ice_and_sea(hex_arr);
    assign_humidity(hex_arr);
    assign_biomes(hex_arr);
    hex_arr_to_map(hex_arr, board_map);
}

function hex_arr_to_map(hex_arr, board_map) {
    // map svg-elements to hexes
    hex_arr.forEach((hex) => {
        board_map.set(hex.cell, hex);
    });
}

// TODO find a way to conveniently zoom on mobile wo zooming overlays etc (cells are rather small on mobile)...perhaps we have to adjust the boards viewBox
const cell_size = 6;
const half_cell_size = cell_size * 0.5;
const three_quarter_cell_size = cell_size * 0.75;

function make_hex_grid({ height, width }) {
    const hex_grid = [];

    for (let row = 0; row < height; row += 1) {
        // shift every other row by half the cell size
        const odd_row = Number(!is_even(row));

        for (let col = 0; col < width; col += 1) {
            // thx to https://www.redblobgames.com/grids/hexagons/#conversions-offset
            const q = col - (row - (row & 1)) * 0.5;

            hex_grid.push(make_hex_cell(
                (col * cell_size) + (odd_row * half_cell_size),
                row * three_quarter_cell_size,
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