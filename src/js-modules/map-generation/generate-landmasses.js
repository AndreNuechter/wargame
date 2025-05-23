import board_dimensions from '../game-objects/board/board-dimensions.js';
import { decrease_temperature, increase_temperature } from './temperatures.js';
import { random_int, random_pick } from '../helper-functions.js';

// TODO instead of sharp cutoffs, use a chance-based approach so this is unlikely and not impossible
const offlimit_rows = new Set(
    [0, 1, 2, board_dimensions.height - 1, board_dimensions.height - 2, board_dimensions.height - 3],
);

export default generate_landmasses;

/**
 * @param {Hex_Cell} hex_obj
 */
function elevate_cell(hex_obj) {
    hex_obj.elevation += 1;

    if (hex_obj.elevation > 1) {
        hex_obj.temperature = decrease_temperature(hex_obj.temperature);
    }
}

/**
 * @param {Hex_Cell[]} hex_arr
 */
function generate_landmasses(hex_arr) {
    const min_landmass_size = 4;
    const max_landmass_size = 13;
    // about 2/3 of the map should be covered by water
    // we divide by 2.5 and not 3 as we'll remove some land further down
    const desired_coverage = hex_arr.length / 2.5;
    let generated_land = 0;

    while (generated_land < desired_coverage) {
        const continent_size = random_int(max_landmass_size, min_landmass_size);
        // start by picking a cell, that's not too close to a pole
        const seed_coord = {
            x: random_int(board_dimensions.width),
            y: random_int(board_dimensions.height - 3, 3),
        };
        const seed = hex_arr.find(
            ({ x, y }) => x === seed_coord.x && y === seed_coord.y,
        );
        // only consider adding neighbors, that aren't too close to a pole
        const candidates = new Set(seed.neighbors.filter(({ y }) => !offlimit_rows.has(y)));
        const picked_additions = new Set();

        generated_land += continent_size;

        elevate_cell(seed);
        picked_additions.add(seed);

        // till the chosen continentsize is reached, add a neighbor that's not too close to a pole and hasnt been added yet
        for (let added_pieces_of_land = 0; added_pieces_of_land < continent_size; added_pieces_of_land += 1) {
            const picked_cell = random_pick([...candidates]);

            elevate_cell(picked_cell);
            picked_additions.add(picked_cell);
            candidates.delete(picked_cell);
            // add eligible neighbors to next possible candidates
            picked_cell.neighbors
                .filter((hex_obj) => !picked_additions.has(hex_obj))
                .filter(({ y }) => !offlimit_rows.has(y))
                .forEach((hex_obj) => candidates.add(hex_obj));
        }
    }

    // erode cells w only 1-2 neighbors
    hex_arr
        .filter((hex_obj) => hex_obj.elevation > 0)
        .forEach((hex_obj) => {
            const count_of_neighbors_above_sea_level = hex_obj.neighbors
                .filter((neighbor) => neighbor.elevation > 0)
                .length;

            if (count_of_neighbors_above_sea_level >= 3) return;

            const random_num = Math.random();

            if (
                (count_of_neighbors_above_sea_level === 2 && random_num > 0.7) ||
                (count_of_neighbors_above_sea_level === 1 && random_num < 0.7)
            ) {
                lower_cell(hex_obj);
            }
        });
    // TODO erode mountains?
}

/**
 * @param {Hex_Cell} hex_obj
 */
function lower_cell(hex_obj) {
    hex_obj.elevation = Math.max(0, hex_obj.elevation - 1);

    if (hex_obj.elevation > 0) {
        hex_obj.temperature = increase_temperature(hex_obj.temperature);
    }
}