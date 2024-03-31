import './js-modules/service-worker-init.js';
import { board } from './js-modules/dom-selections.js';
import { outerHexTmpl, innerHexTmpl, cellGroupTmpl } from './js-modules/dom-creations.js';

// TODO add bioms and pseudo-randomnly apply them to cells

clear_board();
const hex_map = create_hex_cell(7, 4)
    .reduce((hex_cell_map, hex, id) => {
        hex_cell_map.set(render_cell(hex, id), hex);
        return hex_cell_map;
    }, new Map());

// TODO highlight neighbors on click
board.addEventListener('click', ({ target }) => {
    const cell_element = target.closest('.cell');
    console.log(hex_map.get(cell_element), target);
});

function get_neighboring_cells(cell, cells) {
    // TODO impl me
}

function clear_board() {
    board.innerHTML = '';
}

function render_cell({ cx, cy }, id) {
    const group = cellGroupTmpl.cloneNode(true);
    const wrapper = outerHexTmpl.cloneNode(true);
    const filler = innerHexTmpl.cloneNode(true);

    wrapper.setAttribute('transform', `translate(${cx}, ${cy})`);
    filler.setAttribute('transform', `translate(${cx}, ${cy})`);

    group.dataset.id = id;
    group.append(wrapper, filler);

    board.append(group);

    return group;
}

function create_hex_cell(height, width) {
    const heax_cells = [];

    for (let y = 0; y < height; y += 1) {
        // the horizontal distance between adjacent hexagon centers is horiz = width = sqrt(3) * size.
        // The vertical distance is vert == 3 / 4 * height == 3 / 2 * size.
        // NOTE: as the vertical edges are longer, we dont have regular hexagons
        const odd_row = Number(y % 2 > 0);
        // if height is odd we skip the bottom-left cell otherwise the bottom-right
        const bottom_cell_to_skip = height % 2 > 0
            ? 0
            : width - 1;

        for (let x = 0; x < width; x += 1) {
            // skip outlier cells to consistently have 6 neighbors
            if (x === 0 && y === 0) continue;
            if (x === bottom_cell_to_skip && y === (height - 1)) continue;

            heax_cells.push({
                cx: (x * 6) + (odd_row * 3),
                cy: y * 4.5,
                x,
                y,
                z: -x - y
            });
        }
    }

    return heax_cells;
}