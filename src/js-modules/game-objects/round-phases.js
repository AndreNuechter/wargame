import { BIOMES } from '../map-generation/biomes';
import outline_hexregion from '../hex-grid/outline-hexregion';
import {
    cell_info, general_info,
    cell_production_forecast,
    movement_arrows,
    overall_production_forecast,
    selection_highlight,
    troop_select,
    troop_select_input,
} from '../dom-selections';
import {
    make_structure_builder_inputs,
    setup_cell_info,
    setup_cell_production_forecast,
    setup_overall_production_forecast
} from '../setup-sidebar-content';
import { movement_indicator_tmpl } from '../dom-creations';
import RESOURCES, { initial_resources, calculate_resource_production } from './resources';
import move_queue from './move-queue';

// the game starts in the land_grab phase where the players should pick their starting positions.
// after initial positions are picked the first round starts.
// ea round consists of 3 phases: development, movement_planning and movement_execution.
// during development phase structures can be built/deconstructed on owned cells and population thereof turned into other units.
// during movement_planning, units can be directed to adjacent cells (and cells adjacent to that...) to settle, attack or reinforce them.
// during movement_execution phase plans made before are enacted. conflicts between players may happen in this phase.
// resources are generated at the end of movement_execution.

// 4x - explore, expand, exploit, exterminate...how to make exploration more interesting? let mines give unknown resources that are only discovered when building?

let selected_cell = null;
let second_selected_cell = null;

const ROUND_PHASES = {
    land_grab: make_round_phase(
        'land_grab',
        'Pick your origin',
        'Confirm choice',
        (hex_obj) => {
            // did player click on a viable starting cell?
            if (hex_obj.owner_id === -1 && hex_obj.biome !== BIOMES.sea) {
                // set the candidate starting cell
                selected_cell = hex_obj;
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
        (hex_obj, game) => {
            // did the player click on a cell they own?
            if (hex_obj.owner_id === game.current_player_id) {
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
    ),
    movement_planning: make_round_phase(
        'movement_planning',
        'Make your moves',
        undefined,
        (hex_obj, game) => {
            if (selected_cell === null) {
                const follow_up_move =
                    move_queue[game.current_player_id]
                        .find(({ target }) => target === hex_obj);

                if (
                    (hex_obj.owner_id === game.current_player_id &&
                    hex_obj.resources[RESOURCES.people] > 1) ||
                    follow_up_move?.units > 1
                ) {
                    selected_cell = hex_obj;
                } else {
                    hex_obj.cell.classList.remove('clicked');
                }

                return;
            }

            if (selected_cell === hex_obj) {
                selected_cell = null;
                return;
            }

            if (hex_obj.neighbors.includes(selected_cell)) {
                second_selected_cell = hex_obj;
                // TODO set available troop strength in modal
                // troop_select_input.value = selected_cell.resources.people || ;
                troop_select.showModal();
            }
        }
    ),
    movement_execution: make_round_phase('movement_execution', 'See what you have done')
};

export default ROUND_PHASES;

export function plan_move(game) {
    return () => {
        // TODO what happens at the end of the round, do units return home or do they stay where they are?

        // TODO limit max troopsize to origin's population - 1 when cell is owned and moved troops otherwise and to available funds/food
        const sent_troops = Number(troop_select_input.value);
        const configured_move_index = move_queue[game.current_player_id]
            .findIndex(({ origin, target }) =>
                origin === selected_cell && target === second_selected_cell
            );

        // rm highlighting from move_target
        second_selected_cell.cell.classList.remove('clicked');

        // zero or invalid input dismisses the move
        if (Number.isNaN(sent_troops) || sent_troops === 0) {
            selected_cell = null;
            second_selected_cell = null;

            // rm move from queue and arrow from dom
            if (configured_move_index > -1) {
                const [{ arrow }] = move_queue[game.current_player_id].splice(configured_move_index, 1);
                arrow.remove();
            }

            return;
        }

        if (configured_move_index > -1) {
            move_queue[game.current_player_id][configured_move_index].units = sent_troops;
            // TODO update units on arrow
        } else {
            const move = {
                origin: selected_cell,
                target: second_selected_cell,
                units: sent_troops,
            };
            const arrow = draw_movement_arrow(move);

            move.arrow = arrow;
            selected_cell = null;
            second_selected_cell = null;

            move_queue[game.current_player_id].push(move);
        }
    };
}

export function draw_movement_arrow({ origin, target, units }) {
    // NOTE: adding half_hex_size center the path...cx is apparently the upper left corner of the hex's viewBox
    const half_hex_size = 3;
    // TODO start further from the center to not overlay the population count on the cell
    const path_start = {
        x: origin.cx + half_hex_size,
        y: origin.cy + half_hex_size
    };
    const path_end = {
        x: target.cx + half_hex_size,
        y: target.cy + half_hex_size
    };
    const path_mid = {
        x: (path_end.x + path_start.x) * 0.5,
        y: (path_end.y + path_start.y) * 0.5,
    };
    const movement_indicator = movement_indicator_tmpl.cloneNode(true);
    const sent_units_display = movement_indicator.lastElementChild;

    movement_indicator.firstElementChild.setAttribute(
        'd',
        `M${path_start.x} ${path_start.y}L${path_end.x} ${path_end.y}`
    );
    sent_units_display.textContent = units;
    sent_units_display.setAttribute('x', path_mid.x);
    sent_units_display.setAttribute('y', path_mid.y);

    movement_arrows.append(movement_indicator);

    return movement_indicator;
}

export function end_turn_btn_click_handling(game) {
    return () => {
        if (game.current_phase === ROUND_PHASES.land_grab.name) {
            // player did not choose a viable starting cell, so they cant end their turn
            if (selected_cell === null) return;

            // set initial resources on cell
            Object.entries(initial_resources).forEach(([resource_name, amount]) => {
                selected_cell.resources[resource_name] = amount;
            });
            // mark the cell as belonging to the player and give the player the cell
            selected_cell.owner_id = game.current_player_id;
            game.active_player.cells = [selected_cell];

            // unset starting cell candidate and its highlighting
            selected_cell.cell.classList.remove('clicked');
            selected_cell = null;
        }

        game.next_turn();
    };
}

function make_round_phase(
    name = 'round_phase',
    call_to_action = name,
    end_turn_btn_label = 'End turn',
    // eslint-disable-next-line no-unused-vars
    handle_click_on_cell = (hex_obj, game) => {},
) {
    return {
        name,
        call_to_action,
        end_turn_btn_label,
        handle_click_on_cell
    };
}