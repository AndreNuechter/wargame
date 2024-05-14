import { board } from './dom-selections.js';
import { cellGroupTmpl } from './dom-creations.js';
import { TEMPERATURES } from './map-generation/get-temperature.js';
import { HUMIDITY_LEVELS } from './map-generation/assign-humidity.js';

export function create_hex_cell(cx, cy, x, y, q, r, s) {
    const cell = render_hex_cell(cx, cy, x, y, q, r, s);
    let biome_name = '';

    return {
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
        neighbors: [],
        cell,
        elevation: 0,
        humidity: HUMIDITY_LEVELS.arid,
        temperature: TEMPERATURES.freezing,
        get biome() {
            return biome_name;
        },
        set biome(name) {
            biome_name = name;
            cell.dataset.biome = name;
        }
    };
}

function render_hex_cell(
    cx, cy, x, y, q, r, s
) {
    const cellWrapper = cellGroupTmpl.cloneNode(true);

    cellWrapper.setAttribute('transform', `translate(${cx}, ${cy})`);

    // render coords
    const text_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const q_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const r_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const s_coord = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const offset_coords = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    q_coord.textContent = `${q}`;
    r_coord.textContent = `${r}`;
    s_coord.textContent = `${s}`;
    offset_coords.textContent = `${x}, ${y}`;
    q_coord.setAttribute('transform', `translate(${1.5}, ${2})`);
    r_coord.setAttribute('transform', `translate(${4.5}, ${3.5})`);
    s_coord.setAttribute('transform', `translate(${2}, ${5})`);
    offset_coords.setAttribute('transform', `translate(${1.5}, ${3.5})`);
    text_group.classList.add('cell-coord');
    q_coord.classList.add('cube-coord');
    r_coord.classList.add('cube-coord');
    s_coord.classList.add('cube-coord');
    offset_coords.classList.add('offset-coord');
    text_group.append(q_coord, r_coord, s_coord, offset_coords);
    cellWrapper.append(text_group);

    // TODO biome icon or texture

    board.append(cellWrapper);

    return cellWrapper;
}