import board_dimensions from '../map-generation/board-dimensions';
import { is_even } from '../helper-functions';

export default function compute_neighbors(hex_arr) {
    hex_arr.forEach((hex_obj) => {
        hex_obj.neighbors = get_neighboring_cells(hex_obj, hex_arr, board_dimensions);
    });
}

// credits to https://www.redblobgames.com/grids/hexagons/
function get_neighboring_cells({
    q, r, s, x, y
}, cells, board_dimensions) {
    const direction_vectors = [
        { q: 1, r: 0, s: -1 },
        { q: 1, r: -1, s: 0 },
        { q: 0, r: 1, s: -1 },
        { q: 0, r: -1, s: 1 },
        { q: -1, r: 0, s: 1 },
        { q: -1, r: 1, s: 0 }
    ];
    const neighbors = direction_vectors.map((vec) =>
        cells.find(
            (cell) =>
                cell.q === q + vec.q &&
                cell.r === r + vec.r &&
                cell.s === s + vec.s
        )
    ).filter(Boolean);

    // wrap around left edge
    if (x === 0) {
        // add the rightmost cell on the same row
        neighbors.push(
            cells.find((cell) => y === cell.y && cell.x === board_dimensions.width - 1)
        );

        // add the, at most two, cells above and below that as well
        // NOTE: leftmost cells on odd rows only have the one neighbor already added
        if (is_even(y)) {
            neighbors.push(
                ...[
                    y < board_dimensions.height - 1
                        ? cells.find((cell) => y + 1 === cell.y && cell.x === board_dimensions.width - 1)
                        : null,
                    y > 0
                        ? cells.find((cell) => y - 1 === cell.y && cell.x === board_dimensions.width - 1)
                        : null
                ].filter(Boolean)
            );
        }
    }

    // wrap around right edge
    if (x === board_dimensions.width - 1) {
        // add the leftmost cell on the same row
        neighbors.push(cells.find((cell) => y === cell.y && cell.x === 0));

        // add the, at most two, cells above and below that as well
        // NOTE: rightmost cells on even rows only have the one neighbor already added
        if (!is_even(y)) {
            neighbors.push(
                ...[
                    y < board_dimensions.height - 1
                        ? cells.find((cell) => y + 1 === cell.y && cell.x === 0)
                        : null,
                    y > 0
                        ? cells.find((cell) => y - 1 === cell.y && cell.x === 0)
                        : null
                ].filter(Boolean)
            );
        }
    }

    return neighbors;
}