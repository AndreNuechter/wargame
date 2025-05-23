import { assign_temperature } from '../../map-generation/temperatures.js';
import { assign_humidity } from '../../map-generation/humidity-levels.js';
import BIOMES, { assign_biomes, make_ice_and_sea } from '../../map-generation/biomes.js';
import generate_landmasses from '../../map-generation/generate-landmasses.js';
import { is_even } from '../../helper-functions.js';
import compute_neighbors from './compute-neighbors.js';
import { make_hex_cell } from './hex-cell.js';
import { board_element } from '../../dom-selections.js';

const cell_size = 6;
const half_cell_size = cell_size * 0.5;
const three_quarter_cell_size = cell_size * 0.75;

export {
    make_hex_map,
    reinstate_hex_map,
    reroll_map,
};

/**
 * Map svg-elements to hexes.
 * @param {Hex_Cell[]} hex_arr
 * @param {Map<SVGGElement, Hex_Cell>} board_map
 */
function hex_arr_to_map(hex_arr, board_map) {
    hex_arr.forEach((hex_obj) => {
        board_map.set(hex_obj.cell, hex_obj);
    });
}

/**
 * @param {Board_dimensions} param0
 * @returns {Hex_Cell[]}
 */
function make_hex_grid({ height, width }) {
    const hex_arr = [];

    for (let row = 0; row < height; row += 1) {
        // shift every other row by half the cell size
        const odd_row = Number(!is_even(row));

        for (let col = 0; col < width; col += 1) {
            // thx to https://www.redblobgames.com/grids/hexagons/#conversions-offset
            const q = col - (row - (row & 1)) * 0.5;

            hex_arr.push(
                make_hex_cell(
                    (col * cell_size) + (odd_row * half_cell_size),
                    row * three_quarter_cell_size,
                    col,
                    row,
                    q,
                    row,
                    -q - row,
                ),
            );
        }
    }

    return hex_arr;
}

/**
 * @param {Map<SVGGElement, Hex_Cell>} board_map
 * @param {Board_dimensions} board_dimensions
 */
function make_hex_map(board_map, board_dimensions) {
    const hex_arr = make_hex_grid(board_dimensions);

    compute_neighbors(hex_arr);
    assign_temperature(hex_arr);
    generate_landmasses(hex_arr);
    make_ice_and_sea(hex_arr);
    assign_humidity(hex_arr);
    assign_biomes(hex_arr);
    hex_arr_to_map(hex_arr, board_map);
}

/**
 * Recreate previous boardstate after reload.
 * @param {any[]} board_state
 * @param {Map<SVGGElement, Hex_Cell>} board_map
 */
function reinstate_hex_map(board_state = [], board_map) {
    const hex_arr = board_state
        .map(({
            cx, cy, x, y, q, r, s,
            biome_name,
            elevation,
            humidity,
            temperature,
            owner_id,
            resources,
        }) => {
            const hex_cell = make_hex_cell(cx, cy, x, y, q, r, s);

            return Object.assign(
                hex_cell,
                {
                    biome: BIOMES[biome_name],
                    elevation,
                    humidity,
                    // NOTE: we dont use `resources` directly to not overwrite the proxy
                    resources: Object.assign(hex_cell.resources, resources),
                    temperature,
                    owner_id,
                },
            );
        });

    compute_neighbors(hex_arr);

    // sea-tiles neighboring land get a different color
    hex_arr
        .filter((hex_obj) =>
            hex_obj.elevation === 0 &&
            hex_obj.neighbors.some((neighboring_hex_obj) => neighboring_hex_obj.elevation > 0),
        )
        .forEach((sea_tile_bordering_land) => sea_tile_bordering_land.cell.classList.add('shore'));

    hex_arr_to_map(hex_arr, board_map);
}

/**
 * Clear board and create new map.
 * @param {Map<SVGGElement, Hex_Cell>} board_map
 * @param {Board_dimensions} board_dimensions
 */
function reroll_map(board_map, board_dimensions) {
    // TODO it'd be nice to keep as much as we can...use a pool for cells and only create new objects when it's smaller than the desired board?
    // rm data
    board_map.clear();
    // rm cells while keeping the utils
    board_element.replaceChildren(board_element.lastElementChild);
    // create a new board
    make_hex_map(board_map, board_dimensions);
}