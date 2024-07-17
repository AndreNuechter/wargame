import { cell_production_forecast, overall_production_forecast } from '../../dom-selections';
import {
    make_structure_builder_inputs,
    setup_cell_production_forecast,
    setup_overall_production_forecast
} from '../../setup-sidebar-content';
import { calculate_resource_production } from '../resources';

/**
 * Handle clicks on cell during development phase.
 * @param {Hex_Cell} hex_obj - The cell being clicked.
 * @param {game} game - The currently running game.
 */
export function click_on_cell_action(hex_obj, game) {
    // did the player click on a cell they own?
    if (hex_obj.owner_id === game.current_player_id) {
        // hide empire overview and show cell specific overview
        overall_production_forecast.classList.add('hidden');
        setup_cell_production_forecast(
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