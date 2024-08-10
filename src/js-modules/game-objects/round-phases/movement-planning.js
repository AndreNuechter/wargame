import {
    movement_config,
    season_of_move_select,
    settle_cell_toggle,
    troop_select_input,
    troop_select_max_value,
    troop_select_min_value,
    troop_select_output
} from '../../dom-selections';
import move_queue, { make_player_move } from '../move-queue';
import RESOURCES from '../resources';
import SEASONS, { increment_season, is_season_before } from '../seasons';

let move_origin = null;
let move_target = null;

export function click_on_cell_action(hex_obj, game) {
    // player picked origin
    if (move_origin === null) {
        set_move_origin(hex_obj, game);
        return;
    }

    // rm highlight from targeted cell
    hex_obj.cell.classList.remove('clicked');

    // player unselected origin
    if (move_origin === hex_obj) {
        move_origin = null;
        return;
    }

    // player can only move one cell at a time
    if (!hex_obj.neighbors.includes(move_origin)) return;

    move_target = hex_obj;

    // NOTE: to maintain visibility of the arrows, the player can only move one time from one specific cell to another during a round
    const configured_move = move_queue[game.current_player_id].find(
        ({ origin, target }) => origin === move_origin && target === move_target
    );
    const player_owns_origin = move_origin.owner_id === game.current_player_id;
    const player_owns_target = move_target.owner_id === game.current_player_id;
    const form_config = {
        settle_cell: false,
        season: SEASONS.spring
    };

    // enable all season options
    Object.values(SEASONS).forEach((season) => {
        season_of_move_select.querySelector(`input[value="${season}"]`).disabled = false;
    });
    season_of_move_select.inert = false;
    // enable setting movement type if player doesnt own the target
    settle_cell_toggle.inert = player_owns_target;

    // determine appropriate modal config
    if (configured_move) {
        configure_move(configured_move, game, player_owns_origin, form_config);
    } else {
        make_move(game, player_owns_origin, form_config);
    }

    // if the move turns out to be invalid, unset target and do nothing else
    // TODO can this be checked earlier?
    if (form_config.max_value <= 0) {
        move_target = null;
        return;
    }

    // configure modal
    season_of_move_select.querySelector(`input[value="${form_config.season}"]`).checked = true;
    Object.assign(
        troop_select_input,
        {
            value: form_config.current_value,
            min: form_config.min_value,
            max: form_config.max_value
        }
    );
    troop_select_output.value = form_config.current_value;
    troop_select_min_value.value = form_config.min_value;
    troop_select_max_value.value = form_config.max_value;
    settle_cell_toggle.checked = form_config.settle_cell;
    // open modal
    movement_config.showModal();
}

// TODO limit sendable troops by available resources...moving 1 unit costs 1 gold per step (2 over water; 0 inside own territory)...food? people consume 1 food per turn...we'll not consider food here, but give negative effects when starvation occurs, like decreased efficieny or increased chance of revolts...

function configure_move(configured_move, game, player_owns_origin, form_config) {
    form_config.settle_cell = configured_move.type === 'settle';
    form_config.current_value = configured_move.units;
    form_config.season = configured_move.season;
    // the player shouldnt decrease sent units if that'd interfere w later moves
    form_config.min_value = move_queue[game.current_player_id]
        // get all later moves from the target of the configured move
        .filter(
            ({ season: season_of_move, origin }) =>
                is_season_before(configured_move.season, season_of_move) &&
                configured_move.target === origin
        )
        .reduce((sent_troops, { season, origin, units }) => {
            // a follow up, that wouldnt have enough troops, if this move didnt exist,
            // is dependent and cant be deleted
            // TODO allow reduction if the follow up doesnt entirely depend on this one
            if (
                (count_of_units_on_cell_at_season(
                    move_queue[game.current_player_id],
                    origin,
                    season,
                    origin.owner_id === game.current_player_id
                        ? origin.resources[RESOURCES.people]
                        : 0
                ) - configured_move.units) < units
            ) {
                sent_troops += units;
            }

            return sent_troops;
        }, 0);

    // TODO disable season options for which there'd be a move w insufficient troops, if this move'd be made then...for now we just disable it
    season_of_move_select.inert = true;
    // TODO allow player to toggle this
    settle_cell_toggle.inert = true;

    if (player_owns_origin) {
        form_config.max_value = count_of_units_on_cell_at_season(
            move_queue[game.current_player_id],
            move_origin,
            form_config.season,
            move_origin.resources[RESOURCES.people]
        ) - 1 + form_config.current_value;
    } else {
        form_config.max_value = count_of_units_on_cell_at_season(
            move_queue[game.current_player_id],
            move_origin,
            form_config.season,
        ) - Number(form_config.settle_cell) + form_config.current_value;
    }
}

function make_move(game, player_owns_origin, form_config) {
    form_config.current_value = 0;
    form_config.min_value = 0;

    if (player_owns_origin) {
        form_config.max_value = count_of_units_on_cell_at_season(
            move_queue[game.current_player_id],
            move_origin,
            form_config.season,
            move_origin.resources[RESOURCES.people]
        ) - 1;
    } else {
        // set season to the one after that of the earliest move to the origin
        const season_of_earliest_move_to_origin = move_queue[game.current_player_id]
            .filter(({ target }) => target === move_origin)
            .reduce((earliest_season, { season: season_of_move_to_origin }) => {
                if (
                    earliest_season === '' ||
                    is_season_before(season_of_move_to_origin, earliest_season)
                ) {
                    earliest_season = season_of_move_to_origin;
                }

                return earliest_season;
            }, '');
        const player_wants_to_settle_origin = Boolean(
            move_queue[game.current_player_id]
                .find(
                    ({ target, type, season }) => target === move_origin &&
                        season === season_of_earliest_move_to_origin &&
                        type === 'settle'
                )
        );

        // do nothing if the earliest move is in winter
        if (season_of_earliest_move_to_origin === SEASONS.winter) {
            move_target = null;
            return;
        }

        // disable season options before the earliest move to the origin
        Object.values(SEASONS).filter((season) =>
            season === season_of_earliest_move_to_origin ||
            is_season_before(season, season_of_earliest_move_to_origin)
        )
            .forEach((season) => {
                season_of_move_select.querySelector(`input[value="${season}"]`).disabled = true;
            });

        form_config.season = increment_season(season_of_earliest_move_to_origin);
        form_config.max_value = count_of_units_on_cell_at_season(
            move_queue[game.current_player_id],
            move_origin,
            form_config.season,
        ) - Number(player_wants_to_settle_origin);
    }
}

function set_move_origin(hex_obj, game) {
    // player cant abandon owned cells and therefore has to leave at least one unit behind when moving from there
    const player_owns_cell_and_its_population_is_big_enough =
        hex_obj.owner_id === game.current_player_id &&
        hex_obj.resources[RESOURCES.people] > 1;
    const player_has_moved_from_here_before = move_queue[game.current_player_id]
        .find(({ origin }) => origin === hex_obj);
    // a player cant make a follow up move, if the move leading here was made in winter
    const player_could_move_on_from_here = move_queue[game.current_player_id]
        .find(({ target, season }) => target === hex_obj && season !== 'winter');
    const player_has_troops_stationed_here = game.active_player.encampments.has(hex_obj);

    if (
        player_owns_cell_and_its_population_is_big_enough ||
        player_has_moved_from_here_before ||
        player_could_move_on_from_here ||
        player_has_troops_stationed_here
    ) {
        move_origin = hex_obj;
    } else {
        hex_obj.cell.classList.remove('clicked');
    }
}

// TODO this needs to happen when the season in the modal is picked to set the max value of the moved units
function count_of_units_on_cell_at_season(
    player_moves,
    cell,
    season_in_question,
    initial_count = 0
) {
    return player_moves
        .filter(
            ({ origin, target, season: season_of_move }) =>
                (origin === cell || target === cell) &&
                (
                    season_of_move === season_in_question ||
                    is_season_before(season_of_move, season_in_question)
                )
        )
        .reduce(
            (count, move) => {
                if (cell === move.target) {
                    count += move.units;
                } else {
                    count -= move.units;
                }

                return count;
            },
            initial_count
        );
}

export function plan_move(game) {
    return () => {
        const season_of_move = movement_config.querySelector('[name="season-of-move"]:checked').value;
        const sent_troops = Number(troop_select_input.value);
        const settle_target_cell = settle_cell_toggle.checked;
        const configured_move_index = move_queue[game.current_player_id]
            .findIndex(({ origin, target }) =>
                origin === move_origin && target === move_target
            );

        // zero or invalid input dismisses the move
        if (Number.isNaN(sent_troops) || sent_troops <= 0) {
            move_origin = null;
            move_target = null;

            // rm move from queue and arrow from dom
            if (configured_move_index > -1) {
                const [{ arrow }] = move_queue[game.current_player_id].splice(configured_move_index, 1);
                arrow.remove();
            }

            return;
        }

        if (configured_move_index > -1) {
            const configured_move = move_queue[game.current_player_id][configured_move_index];

            // TODO update season
            // TODO update movement type
            configured_move.units = sent_troops;
            // update units on arrow
            // TODO do this automatically when setting units
            configured_move.arrow.lastElementChild.lastElementChild.textContent = sent_troops;
        } else {
            move_queue[game.current_player_id].push(
                make_player_move(
                    move_origin,
                    move_target,
                    sent_troops,
                    season_of_move,
                    settle_target_cell ? 'settle' : 'unspecified'
                )
            );
        }

        move_origin = null;
        move_target = null;
    };
}