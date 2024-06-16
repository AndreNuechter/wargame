import { board } from '../dom-selections.js';
import { cell_group_tmpl } from '../dom-creations.js';
import { TEMPERATURES } from '../map-generation/assign-temperature.js';
import { HUMIDITY_LEVELS } from '../map-generation/assign-humidity.js';
import STRUCTURES from '../game-objects/structures.js';
import RESOURCES from '../game-objects/resources.js';

export function create_hex_cell(cx, cy, x, y, q, r, s) {
    const cell = render_hex_cell(cx, cy, x, y, q, r, s);
    const pop_size_display = cell.querySelector('.population-size');
    let biome = null;
    let owner_id = -1;
    let population = 0;

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
        structures: new Map(Object.values(STRUCTURES).map((structure) => [structure, 0])),
        // TODO tweak capacities
        resources: {
            [RESOURCES.people]: {
                capacity: 5,
                get amount() {
                    return population;
                },
                set amount(value) {
                    population = value;
                    pop_size_display.textContent = population > 0
                        ? population
                        : '';
                }
            },
            [RESOURCES.gold]: {
                capacity: 5,
                amount: 0
            },
            [RESOURCES.cloth]: {
                capacity: 5,
                amount: 0
            },
            [RESOURCES.wood]: {
                capacity: 5,
                amount: 0
            },
            [RESOURCES.stone]: {
                capacity: 5,
                amount: 0
            },
            [RESOURCES.iron]: {
                capacity: 5,
                amount: 0
            },
            [RESOURCES.food]: {
                capacity: 5,
                amount: 0
            },
            [RESOURCES.alcohol]: {
                capacity: 5,
                amount: 0
            }
        },
        get biome() {
            return biome;
        },
        set biome(new_biome) {
            // TODO biome icon or texture
            if (biome !== null) cell.classList.remove(biome.name);
            if (new_biome !== null) cell.classList.add(new_biome.name);
            biome = new_biome;
        },
        get owner_id() {
            return owner_id;
        },
        set owner_id(id) {
            owner_id = id;
            if (id !== -1) cell.dataset.owner_id = id;
        }
    };
}

function render_hex_cell(
    cx, cy, x, y, q, r, s
) {
    const cell_wrapper = cell_group_tmpl.cloneNode(true);

    cell_wrapper.setAttribute('transform', `translate(${cx}, ${cy})`);

    // render coords
    cell_wrapper.querySelector('.q-coord').textContent = q;
    cell_wrapper.querySelector('.r-coord').textContent = r;
    cell_wrapper.querySelector('.s-coord').textContent = s;
    cell_wrapper.querySelector('.offset-coords').textContent = `${x}, ${y}`;

    board.prepend(cell_wrapper);

    return cell_wrapper;
}