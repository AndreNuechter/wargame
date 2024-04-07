import './js-modules/service-worker-init.js';
import { board } from './js-modules/dom-selections.js';
import { cellGroupTmpl } from './js-modules/dom-creations.js';

// TODO add bioms (colors and icons for now) and (pseudo-)randomnly apply them to cells

clear_board();
const board_dimensions = { width: 7, height: 8 };
const hex_map = create_hex_cell(board_dimensions)
    .reduce((hex_cell_map, hex, id) => {
        hex_cell_map.set(render_cell(hex, id), hex);
        return hex_cell_map;
    }, new Map());
// precompute neighbors
[...hex_map.values()].forEach((hex_obj) => {
    hex_obj.neighbors = get_neighboring_cells(hex_obj, [...hex_map]);
});

document.getElementById('toogle-coord-system').addEventListener('click', () => {
    document.body.classList.toggle('use-offset-coords');
});

// highlight neighbors on click
board.addEventListener('click', ({ target }) => {
    const cell_element = target.closest('.cell');

    if (!cell_element) return;

    const previously_selected_cell = document.querySelector('.clicked');

    if (previously_selected_cell) {
        previously_selected_cell.classList.remove('clicked');
        document.querySelectorAll('.adjacent-to-clicked').forEach((cell) => cell.classList.remove('adjacent-to-clicked'));
    }

    cell_element.classList.add('clicked');
    hex_map.get(cell_element).neighbors.forEach((cell) => cell.classList.add('adjacent-to-clicked'));
});

function get_neighboring_cells({
    q, r, s, x, y
}, cells) {
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
            ([, cell]) =>
                cell.q === q + vec.q &&
                cell.r === r + vec.r &&
                cell.s === s + vec.s
        )
    ).filter(Boolean);

    // wrap around left edge
    if (x === 0) {
        // add the rightmost cell on the same row
        neighbors.push(
            cells.find(([, cell]) => y === cell.y && cell.x === board_dimensions.width - 1)
        );

        // add the, at most two, cells above and below that as well
        // NOTE: leftmost cells on odd rows only have the one neighbor already added
        if (is_even(y)) {
            neighbors.push(
                ...[
                    y < board_dimensions.height - 1
                        ? cells.find(([, cell]) => y + 1 === cell.y && cell.x === board_dimensions.width - 1)
                        : null,
                    y > 0
                        ? cells.find(([, cell]) => y - 1 === cell.y && cell.x === board_dimensions.width - 1)
                        : null
                ].filter(Boolean)
            );
        }
    }

    // wrap around right edge
    if (x === board_dimensions.width - 1) {
        // add the leftmost cell on the same row
        neighbors.push(cells.find(([, cell]) => y === cell.y && cell.x === 0));

        // add the, at most two, cells above and below that as well
        // NOTE: rightmost cells on even rows only have the one neighbor already added
        if (!is_even(y)) {
            neighbors.push(
                ...[
                    y < board_dimensions.height - 1
                        ? cells.find(([, cell]) => y + 1 === cell.y && cell.x === 0)
                        : null,
                    y > 0
                        ? cells.find(([, cell]) => y - 1 === cell.y && cell.x === 0)
                        : null
                ].filter(Boolean)
            );
        }
    }

    return neighbors.map(([cell_element]) => cell_element);
}

function is_even(num) {
    return num % 2 === 0;
}

function clear_board() {
    board.innerHTML = '';
}

function render_cell({
    cx, cy, x, y, q, r, s
}, id) {
    const cellWrapper = cellGroupTmpl.cloneNode(true);

    cellWrapper.setAttribute('transform', `translate(${cx}, ${cy})`);
    cellWrapper.dataset.id = id;

    const text_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const q_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const r_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const s_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const offset_ccords = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    // render coords
    q_coord.textContent = `${q}`;
    r_coord.textContent = `${r}`;
    s_coord.textContent = `${s}`;
    offset_ccords.textContent = `${x}, ${y}`;
    q_coord.setAttribute('transform', `translate(${1.5}, ${2})`);
    r_coord.setAttribute('transform', `translate(${4.5}, ${3.5})`);
    s_coord.setAttribute('transform', `translate(${2}, ${5})`);
    offset_ccords.setAttribute('transform', `translate(${1.5}, ${3.5})`);
    q_coord.classList.add('cube-coord');
    r_coord.classList.add('cube-coord');
    s_coord.classList.add('cube-coord');
    offset_ccords.classList.add('offset-coord');
    text_group.append(q_coord, r_coord, s_coord, offset_ccords);
    cellWrapper.append(text_group);

    board.append(cellWrapper);

    return cellWrapper;
}

function create_hex_cell({ height, width }) {
    const hex_cells = [];

    for (let row = 0; row < height; row += 1) {
        const odd_row = Number(!is_even(row));

        for (let col = 0; col < width; col += 1) {
            const q = col - (row - (row & 1)) / 2;

            hex_cells.push({
                cx: (col * 6) + (odd_row * 3),
                cy: row * 4.5,
                // offset coords
                x: col,
                y: row,
                // cube coords
                q,
                r: row,
                s: -q - row
            });
        }
    }

    return hex_cells;
}