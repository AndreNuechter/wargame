import { cell_info, general_info, selection_highlight } from '../../dom-selections';
import BIOMES from '../../map-generation/biomes';
import { setup_cell_info } from '../../setup-sidebar-content';
import outline_hexregion from '../board/outline-hexregion';
import { initial_resources } from '../resources';

let start_position_candidate = null;

export { click_on_cell_action, end_turn_action };

function click_on_cell_action(hex_obj) {
    // did player click on a viable starting cell?
    if (!hex_obj.has_owner && hex_obj.biome !== BIOMES.sea) {
        // set the candidate starting cell
        start_position_candidate = hex_obj;
        // highlight neighbors of clicked cell
        outline_hexregion(new Set([...hex_obj.neighbors, hex_obj]), selection_highlight);
        // hide general info
        general_info.classList.add('hidden');
        // show expected production (and other cell specific factoids) on the side
        setup_cell_info(hex_obj, hex_obj.biome.resource_production);
    } else {
        // hide cell info and show general info
        cell_info.classList.add('hidden');
        general_info.classList.remove('hidden');
    }
}

function end_turn_action(game) {
    if (start_position_candidate === null) return false;

    // set initial resources on cell
    Object.entries(initial_resources).forEach(([resource_name, amount]) => {
        start_position_candidate.resources[resource_name] = amount;
    });
    // give the cell to the player
    game.active_player.add_cell(start_position_candidate);

    // unset starting cell candidate and its highlighting
    start_position_candidate.cell.classList.remove('clicked');
    start_position_candidate = null;

    return true;
}