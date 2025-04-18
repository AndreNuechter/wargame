import { cell_info, general_info, selection_highlight } from '../../dom-selections.js';
import BIOMES from '../../map-generation/biomes.js';
import outline_hexregion from '../board/outline-hexregion.js';
import { calculate_resource_production } from '../resources.js';
import STRUCTURES from '../structures.js';

/** @type {Hex_Cell|null} */
let start_position_candidate = null;

export { click_on_cell_action, end_turn_action };

/**
 * @param {Hex_Cell} hex_obj
 */
function click_on_cell_action(hex_obj) {
    const cant_start_from_clicked_cell = hex_obj.has_owner || hex_obj.biome === BIOMES.sea;

    if (cant_start_from_clicked_cell) {
        // un-highlight the clicked cell
        hex_obj.cell.classList.remove('clicked');
        // hide cell info and show general info
        cell_info.classList.add('hidden');
        general_info.classList.remove('hidden');
    } else {
        // set the candidate starting cell
        start_position_candidate = hex_obj;
        // highlight neighbors of clicked cell
        outline_hexregion(new Set([...hex_obj.neighbors, hex_obj]), selection_highlight);
        // hide general info
        general_info.classList.add('hidden');
        // show expected production (and other cell specific factoids) on the side
        setup_cell_info(hex_obj);
    }
}

/**
 * @param {Game} game
 * @returns {boolean}
 */
function end_turn_action(game) {
    if (start_position_candidate === null) return false;

    const player = game.active_player;
    const resource_production = calculate_resource_production(player.cells, player.tax_rate);

    // give the cell to the player
    player.add_cell(start_position_candidate);
    // set initial resources
    Object.assign(start_position_candidate.resources, {
        ...resource_production,
        people: 5,
    });
    // unset starting cell candidate and its highlighting
    start_position_candidate.cell.classList.remove('clicked');
    start_position_candidate = null;

    return true;
}

/**
 * @param {Hex_Cell} hex_obj
 */
function setup_cell_info(hex_obj) {
    const { wood, stone, food } = hex_obj.biome.resource_production;
    const supported_structures = Object.values(STRUCTURES)
        .filter((structure) => !structure.unsupported_biomes.has(hex_obj.biome))
        .map(({ display_name }) => `<li>${display_name}</li>`)
        .join('');

    cell_info.innerHTML = `
        <h2>Cell Info</h2>
        <ul>
            <li>Biome: ${hex_obj.biome.name}</li>
            <li>...</li>
        </ul>
        <h3>Production</h3>
        <ul>
            <li>Wood: ${wood}</li>
            <li>Stone: ${stone}</li>
            <li>Food: ${food}</li>
        </ul>
        <h3>Supported structures</h3>
        <ul>${supported_structures}</ul>
    `;
    cell_info.classList.remove('hidden');
}