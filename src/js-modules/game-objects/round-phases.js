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
import { path_tmpl } from '../dom-creations';
import RESOURCES, { initial_resources, calculate_resource_production } from './resources';
import move_queue from './move-queue';

// the game starts in the land_grab phase where the players should pick their starting positions.
// after initial positions are picked the first round starts.
// ea round consists of 3 phases: development, movement_planning and movement_execution.
// during development phase structures can be built/deconstructed on owned cells and population thereof turned into other units.
// during movement_planning, units can be directed to adjacent cells (and cells adjacent to that...) to settle, attack or reinforce them.
// during movement_execution phase plans made before are enacted. conflicts between players may happen in this phase.
// resources are generated at the end of movement_execution.

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
                selected_cell = hex_obj.cell;
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
                }

                return;
            }

            if (selected_cell === hex_obj) {
                selected_cell = null;
                return;
            }

            if (hex_obj.neighbors.includes(selected_cell)) {
                second_selected_cell = hex_obj;
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
            .findIndex(({ origin, target }) => origin === selected_cell && target === second_selected_cell);

        // zero or invalid input dismisses the move
        if (Number.isNaN(sent_troops) || sent_troops === 0) {
            // TODO rm highlighting (.clicked?)
            selected_cell = null;
            second_selected_cell = null;

            if (configured_move_index > -1) {
                move_queue[game.current_player_id].splice(configured_move_index, 1);
                // TODO rm arrow...store ref to arrow on move?!
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

            draw_movement_arrow(move);
            move_queue[game.current_player_id].push(move);
        }
    };
}

export function draw_movement_arrow({ origin, target, units }) {
    // TODO add number of troops sent
    // TODO why not create an arrow symbol that we position/rotate via transforms?
    // look here https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
    const path = path_tmpl.cloneNode(true);
    // NOTE: adding 3 (= half the hex size) to correctly center the path...cx is apparently not really the center of the hex, but the upper left corner of its viewBox
    path.setAttribute(
        'd',
        `M${origin.cx + 3} ${origin.cy + 3}L${target.cx + 3} ${target.cy + 3}`
    );
    // TODO use player color
    path.setAttribute(
        'stroke',
        'white'
    );
    path.setAttribute(
        'marker-end',
        'url(#arrow)'
    );

    // TODO this should overlay everything (except the num on the origin)
    movement_arrows.append(path);
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