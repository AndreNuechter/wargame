import STRUCTURES from './structures';
import { calculate_resource_production } from './player';
import { BIOMES } from '../map-generation/biomes';
import outline_hexregion from '../hex-grid/outline-hexregion';
import { selection_highlight, cell_production_forecast, overall_production_forecast } from '../dom-selections';
import resources from './resources';

let selected_cell = null;

const ROUND_PHASES = {
    land_grab: make_round_phase(
        'land_grab',
        'Pick your origin',
        'Confirm choice',
        (hex_obj, cell_element) => {
            if (hex_obj.owner_id === -1 && hex_obj.biome !== BIOMES.sea) {
                const cell_output = hex_obj.biome.resource_production;
                const supported_structures = Object.values(STRUCTURES)
                    .filter((structure) => !structure.unsupported_biomes.includes(hex_obj.biome))
                    .map(({ display_name }) => `<li>${display_name}</li>`)
                    .join('');
                selected_cell = cell_element;
                // highlight clicked cell and its neighbors
                cell_element.classList.add('clicked');
                outline_hexregion([...hex_obj.neighbors, hex_obj], 'white', selection_highlight);
                // show expected production (and other cell specific factoids) on the side
                cell_production_forecast.innerHTML = `
            <h2>Cell Info</h2>
            <div>Biome: ${hex_obj.biome.name}</div>
            <div>Movement modifier: ${hex_obj.biome.movement_speed}</div>
            <div>Pleasantness: ${hex_obj.biome.pleasantness}</div>
            ...
            <h3>Production</h3>
            <div>Wood: ${cell_output.wood}</div>
            <div>Stone: ${cell_output.stone}</div>
            <div>Cloth: ${cell_output.cloth}</div>
            <div>Food: ${cell_output.food}</div>
            <h3>Supported structures</h3>
            <ul>${supported_structures}</ul>
            `;
            } else {
                cell_production_forecast.replaceChildren();
            }
        }
    ),
    development: make_round_phase(
        'development',
        'Distribute your wealth',
        undefined,
        (hex_obj, _, game) => {
            if (hex_obj.owner_id !== game.current_player_id) {
                const total_production = calculate_resource_production(
                    game.active_player.cells,
                    game.active_player.tax_rate
                );
                const total_production_list = Object
                    .entries(total_production)
                    .map(([resource, value]) => `<li>${resource}: ${value}</li>`)
                    .join('');
                cell_production_forecast.replaceChildren();
                overall_production_forecast
                    .innerHTML = `
                <h2>Empire Overview</h2>
                <h3>Population</h3>
                ...
                <h3>Production</h3>
                <ul>
                    ${total_production_list}
                </ul>
                <form>
                    <h3>Tax Rate</h3>
                    <input
                        type="range"
                        name="tax_rate"
                        min="0"
                        step="1"
                        value="${game.active_player.tax_rate}"
                    >
                </form>
                `;
            } else {
                const structure_builder_inputs = Object
                    .entries(STRUCTURES)
                    // TODO add icon to toggle structure info
                    .map(([name, structure]) => `
                <label>
                    <div class="label-text">${structure.display_name}: </div>
                    <input
                        type="number"
                        class="structure-builder"
                        name="${name}"
                        value="${hex_obj.structures.get(structure)}"
                        min="0"
                    >
                </label>`)
                    .join('');
                const cell_output = calculate_resource_production(
                    [hex_obj],
                    game.active_player.tax_rate
                );
                const output_list = Object
                    .entries(cell_output)
                    .map(([resource, value]) => `<li>${resource}: ${value}</li>`)
                    .join('');
                selected_cell = hex_obj;

                // TODO enable turning population into other units (on cells w required structures)
                overall_production_forecast.replaceChildren();
                cell_production_forecast.innerHTML = `
                <h2>Cell Overview</h2>
                <h3>Cell Output</h3>
                <ul>
                    ${output_list}
                </ul>
                <form>
                    <h3>Build Structures</h3>
                    ${structure_builder_inputs}
                </form>`;
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
            // TODO keep user from entering values by keyboard...use other ui element
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
            cell_production_forecast.querySelector('ul').innerHTML = (
                Object
                    .entries(calculate_resource_production(
                        [selected_cell],
                        game.active_player.tax_rate
                    ))
                    .map(([resource, value]) => `<li>${resource}: ${value}</li>`)
                    .join('')
            );
            // update total resources
            game.update_resource_display();
        }
    };
}
export function end_turn_btn_click_handling(game) {
    return () => {
        if (game.current_phase === ROUND_PHASES.land_grab.name) {
            // TODO let player know he needs to pick a non-sea starting position
            if (selected_cell === null) return;

            const hex_obj = game.board.get(selected_cell);

            Object.assign(hex_obj, {
                owner_id: game.current_player_id,
                population: game.active_player.resources[resources.people]
            });
            game.active_player.cells = [hex_obj];

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