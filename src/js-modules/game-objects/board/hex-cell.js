import { board_element, selection_highlight } from '../../dom-selections.js';
import { cell_group_tmpl } from '../../dom-creations.js';
import TEMPERATURES from '../../map-generation/temperatures.js';
import HUMIDITY_LEVELS from '../../map-generation/humidity-levels.js';
import STRUCTURES from '../structures.js';
import RESOURCES from '../resources.js';
import ROUND_PHASES from '../round-phases/round-phases.js';
import BIOMES from '../../map-generation/biomes.js';

export {
    make_hex_cell,
    select_cell,
};

/**
 * Create a Hex_Cell object.
 * @param {Number} cx X coordinate of the left upper corner of the Hex cell's bounding box.
 * @param {Number} cy y coordinate of the left upper corner of the Hex cell's bounding box.
 * @param {Number} x Vertical component of the hex cell's offset position (the collumn).
 * @param {Number} y Horizontal component of the hex cell's offset position (the row).
 * @param {Number} q Vertical component of the hex cell's position.
 * @param {Number} r Vertical component of the hex cell's position.
 * @param {Number} s Vertical component of the hex cell's position.
 * @returns {Hex_Cell}
 */
function make_hex_cell(
    cx,
    cy,
    x,
    y,
    q,
    r,
    s,
) {
    const cell = render_hex_cell(cx, cy);
    const pop_size_display = /** @type {SVGTextElement} */ (cell.querySelector('.population-size'));
    let biome = null;
    let temperature = TEMPERATURES.freezing;
    let owner_id = -1;
    let population = 0;
    // TODO procedurally define developable_land
    // TODO modulate biome.resource production by developable_land (multiply values by number of undeveloped land)
    // TODO also give limited space for food production
    let developable_land = 10;

    return {
        // for positioning in grid
        // TODO rename these as they describe the top-left edge of the bounding box, not the center
        cx,
        cy,
        // offset coords
        x,
        y,
        // cube coords
        q,
        r,
        s,
        get has_owner() {
            return owner_id !== -1;
        },
        neighbors: [],
        cell,
        elevation: 0,
        humidity: HUMIDITY_LEVELS.arid,
        get temperature() {
            return temperature;
        },
        set temperature(temp) {
            temperature = temp;
            cell.dataset.temperature = temp;
        },
        structures: new Map(Object.values(STRUCTURES).map((structure) => [structure, 0])),
        pop_size_display,
        resources: {
            get [RESOURCES.people]() {
                return population;
            },
            set [RESOURCES.people](value) {
                population = value;
                pop_size_display.textContent = population > 0
                    ? population.toString()
                    : '';
            },
            [RESOURCES.gold]: 0,
            [RESOURCES.wood]: 0,
            [RESOURCES.stone]: 0,
            [RESOURCES.iron]: 0,
            [RESOURCES.food]: 0,
            [RESOURCES.alcohol]: 0,
            [RESOURCES.coal]: 0,
        },
        get biome() {
            return biome;
        },
        set biome(new_biome) {
            if (biome !== null) cell.classList.remove(biome.name);
            if (new_biome !== null) cell.classList.add(new_biome.name);
            if (new_biome === BIOMES.sea) developable_land = 0;

            biome = new_biome;
        },
        get owner_id() {
            return owner_id;
        },
        set owner_id(id) {
            owner_id = id;
            cell.dataset.owner_id = id === -1 ? '' : id.toString();
        },
        get developable_land() {
            return developable_land;
        },
        set developable_land(value) {
            developable_land = value;
        },
    };
}

/**
 * @param {number} cx
 * @param {number} cy
 * @returns {SVGGElement}
 */
function render_hex_cell(cx, cy) {
    const cell_wrapper = /** @type {SVGGElement} */ (cell_group_tmpl.cloneNode(true));

    cell_wrapper.setAttribute('transform', `translate(${cx}, ${cy})`);

    board_element.prepend(cell_wrapper);

    return cell_wrapper;
}

/**
 * Returns a handler for clicks on the board.
 * @param {Game} game
 * @returns {() => void}
 */
function select_cell(game) {
    return ({ target }) => {
        if (!(target instanceof Element)) return;

        const cell_element = /** @type {SVGGElement} */ (target.closest('.cell-wrapper'));

        if (cell_element === null) return;

        const previously_clicked_cell = board_element.querySelector('.clicked');
        const hex_obj = game.board.get(cell_element);

        if (previously_clicked_cell) {
            previously_clicked_cell.classList.remove('clicked');
            // clear focus highlighting
            selection_highlight.replaceChildren();
        }

        // player de-selected a cell
        if (previously_clicked_cell !== cell_element) {
            cell_element.classList.add('clicked');
        }

        ROUND_PHASES[game.current_phase].handle_click_on_cell(hex_obj, game);
    };
}