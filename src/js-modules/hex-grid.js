import compute_neighbors from './compute-neighbors.js';
import generate_landmasses from './map-generation/generate-landmasses.js';
import get_temperatures from './map-generation/get-temperature.js';
import assign_biomes, { create_ice_and_sea } from './biomes.js';
import assign_humidity from './map-generation/assign-humidity.js';
import { is_even } from './helper-functions.js';
import { Hex_cell } from './hex-cell.js';

export default function Hex_grid(board_dimensions) {
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

    // return map of svg-elements to hexes
    return hex_arr.reduce((map, hex) => {
        map.set(hex.cell, hex);
        return map;
    }, new Map());
}

function create_hex_grid({ height, width }) {
    const hex_grid = [];

    for (let row = 0; row < height; row += 1) {
        const odd_row = Number(!is_even(row));

        for (let col = 0; col < width; col += 1) {
            const q = col - (row - (row & 1)) / 2;

            hex_grid.push(new Hex_cell(
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