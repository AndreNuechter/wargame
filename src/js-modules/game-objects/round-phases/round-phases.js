import {
    click_on_cell_action as handle_land_grab,
    end_turn_action as assign_starting_position,
} from './land-grab.js';
import { click_on_cell_action as handle_development } from './development.js';
import { click_on_cell_action as handle_movement_planning } from './movement-planning.js';

const ROUND_PHASES = {
    land_grab: make_round_phase(
        'land_grab',
        'Pick your origin',
        'Confirm choice',
        handle_land_grab,
    ),
    development: make_round_phase(
        'development',
        'Pick one of your cells and develop it',
        undefined,
        handle_development,
    ),
    movement_planning: make_round_phase(
        'movement_planning',
        'Make your moves',
        undefined,
        handle_movement_planning,
    ),
    movement_execution: make_round_phase(
        'movement_execution',
        '',
        'Start Movement Phase',
    ),
    game_over: make_round_phase(
        'game_over',
        '',
        'Pick your origin',
    ),
};

export default ROUND_PHASES;
export { end_turn_btn_click_handling };

/**
 * @param {Game} game
 * @returns {() => void}
 */
function end_turn_btn_click_handling(game) {
    return () => {
        // player did not choose a viable starting cell, so they cant end their turn
        if (game.current_phase === ROUND_PHASES.land_grab.name && !assign_starting_position(game)) return;

        // this phase consists of phases itself and we dont continue before they are done
        if (game.current_phase === ROUND_PHASES.movement_execution.name) {
            const { done } = game.moves.next();

            if (!done) return;
        }

        game.next_turn();
    };
}

/**
 * @param {String} name
 * @param {String} call_to_action
 * @param {String} end_turn_btn_label
 * @param {(Hex_Cell, Game) => void} handle_click_on_cell
 * @returns {Round_Phase}
 */
function make_round_phase(
    name = 'round_phase',
    call_to_action = '',
    end_turn_btn_label = 'End turn',
    // eslint-disable-next-line no-unused-vars
    handle_click_on_cell = (hex_obj, game) => { },
) {
    return {
        name,
        call_to_action,
        end_turn_btn_label,
        handle_click_on_cell,
    };
}