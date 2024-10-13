import { cell_production_forecast, overall_production_forecast } from '../../dom-selections';
import {
    make_structure_builder_inputs,
    setup_content_for_own_cell,
    setup_overall_production_forecast
} from '../../setup-sidebar-content';
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
        overall_production_forecast.classList.add('hidden');
        setup_content_for_own_cell(
            calculate_resource_production(
                [hex_obj],
                game.active_player.tax_rate
            ),
            make_structure_builder_inputs(hex_obj)
        );
    } else {
        // hide cell specific overview
        cell_production_forecast.classList.add('hidden');
        // show empire overview
        setup_overall_production_forecast(
            calculate_resource_production(
                game.active_player.cells,
                game.active_player.tax_rate
            ),
            game.active_player.tax_rate
        );
    }
}