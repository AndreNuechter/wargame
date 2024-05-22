export default {
    land_grab: make_round_phase('land_grab', 'Pick your origin', 'Confirm choice'),
    development: make_round_phase('development'),
    movement_planning: make_round_phase('movement_planning'),
    movement_execution: make_round_phase('movement_execution')
};

function make_round_phase(name, call_to_action = name, end_turn_btn_label = 'End turn') {
    return {
        name,
        call_to_action,
        end_turn_btn_label
    };
}