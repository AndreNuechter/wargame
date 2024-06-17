import { calculate_resource_production } from './player';
import { BIOMES } from '../map-generation/biomes';
import outline_hexregion from '../hex-grid/outline-hexregion';
import {
    selection_highlight, cell_production_forecast, overall_production_forecast, cell_info, general_info
} from '../dom-selections';
import {
    make_structure_builder_inputs,
    setup_cell_info,
    setup_cell_production_forecast,
    setup_overall_production_forecast
} from '../setup-sidebar-content';
import { initial_resources } from './resources';

// the game starts in the land_grab phase where the players should pick their starting positions.
// after initial positions are picked the first round starts.
// ea round consists of 3 phases: development, movement_planning and movement_execution.
// during development phase structures can be built/deconstructed on owned cells and population thereof turned into other units.
// during movement_planning, units can be directed to adjacent cells (and cells adjacent to that...) to settle, attack or reinforce them.
// during movement_execution phase plans made before are enacted. conflicts between players may happen in this phase.
// resources are generated at the end of movement_execution.

let selected_cell = null;

const ROUND_PHASES = {
    land_grab: make_round_phase(
        'land_grab',
        'Pick your origin',
        'Confirm choice',
        (hex_obj, cell_element) => {
            // did player click on a viable starting cell?
            if (hex_obj.owner_id === -1 && hex_obj.biome !== BIOMES.sea) {
                // set the candidate starting cell
                selected_cell = cell_element;
                // highlight neighbors of clicked cell
                outline_hexregion([...hex_obj.neighbors, hex_obj], 'white', selection_highlight);
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
    ),
    development: make_round_phase(
        'development',
        'Distribute your wealth',
        undefined,
        (hex_obj, _, game) => {
            // did the player click on a cell they own?
            if (hex_obj.owner_id !== game.current_player_id) {
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
            } else {
                // store ref to selected owned cell for development pruposes
                selected_cell = hex_obj;

                // hide empire overview and show cell specific overview
                overall_production_forecast.classList.add('hidden');
                setup_cell_production_forecast(
                    calculate_resource_production(
                        [hex_obj],
                        game.active_player.tax_rate
                    ),
                    make_structure_builder_inputs(hex_obj)
                );
            }
        }
    ),
    movement_planning: make_round_phase('movement_planning', 'Make your moves'),
    movement_execution: make_round_phase('movement_execution', 'See what you have done')
};

export default ROUND_PHASES;

export function side_bar_input_handling(game) {
    return ({ target }) => {
        const entered_value = Number(target.value);

        if (target.name === 'tax_rate') {
            game.active_player.tax_rate = entered_value;
        }
    };
}

export function end_turn_btn_click_handling(game) {
    return () => {
        if (game.current_phase === ROUND_PHASES.land_grab.name) {
            // player did not choose a viable starting cell, so they cant end their turn
            if (selected_cell === null) return;

            // get the related hex-obj
            const hex_obj = game.board.get(selected_cell);

            // set initial resources on cell
            Object.entries(initial_resources).forEach(([resource_name, amount]) => {
                hex_obj.resources[resource_name] = amount;
            });
            // mark the cell as belonging to the player and give the player the cell
            hex_obj.owner_id = game.current_player_id;
            game.active_player.cells = [hex_obj];

            // unset starting cell candidate
            selected_cell = null;
        }

        game.next_turn();
    };
}

function make_round_phase(
    name = 'round_phase',
    call_to_action = name,
    end_turn_btn_label = 'End turn',
    handler_function = () => {},
) {
    return {
        name,
        call_to_action,
        end_turn_btn_label,
        handler_function
    };
}