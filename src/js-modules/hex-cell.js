import { board } from './dom-selections.js';
import { cellGroupTmpl } from './dom-creations.js';

export function Hex_cell(cx, cy, x, y, q, r, s, biom) {
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
        render: render_hex_cell
    };
}

function render_hex_cell({
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