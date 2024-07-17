import { click_on_cell_action as handle_land_grab, end_turn_action } from './land-grab';
import { click_on_cell_action as handle_development } from './development';
import { click_on_cell_action as handle_movement_planning } from './movement-planning';

// the game starts in the land_grab phase where the players should pick their starting positions.
// after initial positions are picked the first round starts.
// ea round consists of 3 phases: development, movement_planning and movement_execution.
// during development phase structures can be built/deconstructed on owned cells and population thereof turned into other units.
// during movement_planning, units can be directed to adjacent cells (and cells adjacent to that...) to settle, attack or reinforce them.
// during movement_execution phase plans made before are enacted. conflicts between players may happen in this phase.
// resources are generated at the end of movement_execution.

// 4x - explore, expand, exploit, exterminate...how to make exploration more interesting? let mines give unknown resources that are only discovered when building?

const ROUND_PHASES = {
    land_grab: make_round_phase(
        'land_grab',
        'Pick your origin',
        'Confirm choice',
        handle_land_grab
    ),
    development: make_round_phase(
        'development',
        'Distribute your wealth',
        undefined,
        handle_development
    ),
    movement_planning: make_round_phase(
        'movement_planning',
        'Make your moves',
        undefined,
        handle_movement_planning
    ),
    movement_execution: make_round_phase('movement_execution', 'See what you have done')
};

export default ROUND_PHASES;

export function end_turn_btn_click_handling(game) {
    return () => {
        if (game.current_phase === ROUND_PHASES.land_grab.name) {
            end_turn_action(game);
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