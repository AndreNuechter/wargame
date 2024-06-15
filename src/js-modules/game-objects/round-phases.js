import STRUCTURES from './structures';
import { calculate_resource_production } from './player';
import { BIOMES } from '../map-generation/biomes';
import outline_hexregion from '../hex-grid/outline-hexregion';
import {
    selection_highlight, cell_production_forecast, overall_production_forecast, cell_info, general_info
} from '../dom-selections';
import resources from './resources';
import {
    make_resource_list,
    make_structure_builder_inputs,
    setup_cell_info,
    setup_cell_production_forecast,
    setup_overall_production_forecast
} from '../setup-sidebar-content';

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
            if (hex_obj.owner_id !== game.current_player_id) {
                cell_production_forecast.classList.add('hidden');
                setup_overall_production_forecast(
                    calculate_resource_production(
                        game.active_player.cells,
                        game.active_player.tax_rate
                    ),
                    game.active_player.tax_rate
                );
            } else {
                selected_cell = hex_obj;

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
        } else if (target.classList.contains('structure-builder')) {
            const structure = STRUCTURES[target.name];
            const structure_current_count = selected_cell.structures.get(structure);

            if (entered_value < 0) {
                target.value = structure_current_count;
                return;
            }

            const structure_cost = STRUCTURES[target.name].construction_cost;
            const building_structure = entered_value > structure_current_count;

            if (building_structure) {
                const player_isnt_rich_enough = structure_cost
                    .some(({ resource_name, amount }) => amount > game.active_player.resources[resource_name]);

                if (player_isnt_rich_enough) {
                    target.value = structure_current_count;
                    return;
                }

                // subtract resources
                structure_cost.forEach(({ resource_name, amount }) => {
                    game.active_player.resources[resource_name] -= amount;
                });
            } else {
            // add resources
                structure_cost.forEach(({ resource_name, amount }) => {
                    game.active_player.resources[resource_name] += amount;
                });
            }

            // update structure count on cell
            selected_cell.structures.set(structure, entered_value);
            // update cell production
            cell_production_forecast.querySelector('ul').replaceChildren(
                ...make_resource_list(calculate_resource_production(
                    [selected_cell],
                    game.active_player.tax_rate
                ))
            );
            // update total resources
            game.update_resource_display();
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

            // set owner and initial population on cell
            Object.assign(hex_obj, {
                owner_id: game.current_player_id,
                population: game.active_player.resources[resources.people]
            });
            // give the player the chosen cell
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