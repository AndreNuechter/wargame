import { board } from './dom-selections.js';
import { cellGroupTmpl } from './dom-creations.js';
import { is_even, random_pick } from './helper-functions.js';
import BIOMS from './bioms.js';

export function render_hex_cell({
    cx, cy, x, y, q, r, s, biom
}) {
    const cellWrapper = cellGroupTmpl.cloneNode(true);

    cellWrapper.setAttribute('transform', `translate(${cx}, ${cy})`);
    cellWrapper.dataset.biom = biom;

    // render coords
    const text_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const q_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const r_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const s_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const offset_ccords = document.createElementNS('http://www.w3.org/2000/svg', 'text');
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

    // TODO render biom icon

    board.append(cellWrapper);

    return cellWrapper;
}

export function create_hex_grid({ height, width }) {
    const hex_grid = [];

    for (let row = 0; row < height; row += 1) {
        const odd_row = Number(!is_even(row));

        for (let col = 0; col < width; col += 1) {
            const q = col - (row - (row & 1)) / 2;
            const biom = row === 0 || row === height - 1
                ? BIOMS.ice.name
                // TODO put some logic behind what biom gets picked
                // see Rimworld, for more bioms
                // give bioms (configurable) probability (eg water is the most common form one on earth)
                // use a row based (configrable?) temperature scale to decide what type of land to use (ie poles are coldest, midline hottest...)
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

function Hex_cell(cx, cy, x, y, q, r, s, biom) {
    return {
        biom,
        // for positioning in grid
        cx,
        cy,
        // offset coords
        x,
        y,
        // cube coords
        q,
        r,
        s,
    };
}