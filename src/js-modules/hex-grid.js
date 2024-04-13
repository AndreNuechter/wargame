import BIOMS from './bioms.js';
import get_neighboring_cells from './get-neighboring-cells.js';
import { is_even, random_pick } from './helper-functions.js';
import { Hex_cell } from './hex-cell.js';

export default function Hex_grid(board_dimensions) {
    const hex_map = create_hex_grid(board_dimensions)
        .reduce((hex_cell_map, hex) => {
            hex_cell_map.set(hex.render(hex), hex);
            return hex_cell_map;
        }, new Map());
    // precompute neighbors
    [...hex_map.values()].forEach((hex_obj) => {
        hex_obj.neighbors = get_neighboring_cells(hex_obj, [...hex_map], board_dimensions);
    });

    return hex_map;
}

function create_hex_grid({ height, width }) {
    const hex_grid = [];

    for (let row = 0; row < height; row += 1) {
        const odd_row = Number(!is_even(row));

        for (let col = 0; col < width; col += 1) {
            const q = col - (row - (row & 1)) / 2;
            const biom = row === 0 || row === height - 1
                ? BIOMS.ice.name
                // TODO put some more logic behind what biom gets picked.
                // see Rimworld, for more bioms.
                // give bioms (configurable) probability (eg water is the most common form one on earth)
                // use a row based (configurable?) temperature scale to decide what type of land to use (ie poles are coldest, midline hottest...)
                : random_pick(Object.values(BIOMS).slice(1).map(({ name }) => name));

            hex_grid.push(new Hex_cell(
                (col * 6) + (odd_row * 3),
                row * 4.5,
                col,
                row,
                q,
                row,
                -q - row,
                biom
            ));
        }
    }

    return hex_grid;
}