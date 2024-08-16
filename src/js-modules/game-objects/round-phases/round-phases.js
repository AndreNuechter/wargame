import {
    click_on_cell_action as handle_land_grab,
    end_turn_action as assign_starting_position
} from './land-grab';
import { click_on_cell_action as handle_development } from './development';
import { click_on_cell_action as handle_movement_planning } from './movement-planning';

// the game starts in the land_grab phase where the players should pick their starting positions (their capitol).
// after initial positions are picked, the first round starts.
// ea round consists of 3 phases: development, movement_planning and movement_execution.
// ea phase starts w player 1 and continues w player 2 until all players had their turn.
// during the development phase structures can be built/deconstructed on owned cells and population thereof turned into other units.
// during the movement_planning phase, units can be sent to adjacent cells (and cells adjacent to that...) to explore, plunder, settle, attack or reinforce them.
// during the movement_execution phase, plans made before are enacted. conflicts between players (=battles) may happen in this phase.
// resources are generated at the end of movement_execution.

// TODO 4X - explore, expand, exploit, exterminate...how to make exploration more interesting? let mines give unknown resources (think fields of coal, iron or gold) that are only discovered when building? add treasures ("remains of old civilizations") randomly?

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
    movement_execution: make_round_phase(
        'movement_execution',
        '',
        'Start Movement Phase'
    )
};

export default ROUND_PHASES;

let current_movement_step = '';

export function end_turn_btn_click_handling(game) {
    return () => {
        if (game.current_phase === ROUND_PHASES.land_grab.name) {
            assign_starting_position(game);
        } else if (
            game.current_phase === ROUND_PHASES.movement_execution.name &&
            current_movement_step === ''
        ) {
            const { value, done } = game.moves.next();

            console.log(value);

            current_movement_step = value;

            if (current_movement_step === 'init_move') {
                setTimeout(() => {
                    game.moves.next();
                    current_movement_step = '';
                }, 500);
            }

            if (!done) return;
        }

        game.next_turn();
    };
}

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
        handle_click_on_cell
    };
}