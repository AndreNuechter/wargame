import { cell_production_forecast, total_production_forecast } from '../../dom-selections';
import { make_resource_list } from '../../helper-functions';
import make_structure_builder_inputs from '../../make-structure-builder-inputs';
import setup_total_production_forecast from '../../setup-total-production-forecast';
import { calculate_resource_production } from '../resources';

export { click_on_cell_action };

/**
 * Handle clicks on cells during development phase.
 * @param {Hex_Cell} hex_obj - The clicked cell.
 * @param {Game} game - The currently running game.
 */
function click_on_cell_action(hex_obj, game) {
    // did the player click on a cell they own?
    if (hex_obj.owner_id === game.current_player_id) {
        // hide empire overview and show cell specific overview
        total_production_forecast.classList.add('hidden');
        setup_content_for_own_cell(
            calculate_resource_production(
                new Set([hex_obj]),
                game.active_player.tax_rate,
            ),
            make_structure_builder_inputs(hex_obj, game),
        );
    } else {
        // hide cell specific overview
        cell_production_forecast.classList.add('hidden');
        // show empire overview
        setup_total_production_forecast(
            calculate_resource_production(
                game.active_player.cells,
                game.active_player.tax_rate,
            ),
            game.active_player.tax_rate,
        );
    }
}

/**
 * @param {Resource_Output} resources
 * @param {HTMLDivElement[]} structure_builder_inputs
 */
function setup_content_for_own_cell(resources, structure_builder_inputs) {
    // TODO enable turning population into other units (on cells w required structures)
    cell_production_forecast.querySelector('ul').replaceChildren(...make_resource_list(resources));
    cell_production_forecast.querySelector('fieldset').replaceChildren(...structure_builder_inputs);
    cell_production_forecast.classList.remove('hidden');
}