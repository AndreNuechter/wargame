import { movement_config, season_of_move_select, troop_select_input, troop_select_output } from '../../dom-selections';
import move_queue, { make_player_move } from '../move-queue';
import RESOURCES from '../resources';
import SEASONS, { increment_season, is_season_before } from '../seasons';

let move_origin;
let move_target;

// eslint-disable-next-line max-statements
export function click_on_cell_action(hex_obj, game) {
    // player picked origin
    if (move_origin === null) {
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
    let current_value;
    // TODO limit sendable troops by available resources...moving 1 unit costs 1 gold per step (2 over water; 0 inside own territory)...food? people consume 1 food per turn...we'll not consider food here, but give negative effects when starvation occurs, like decreased efficieny or revolts...
    let max_value;
    let min_value;
    let season = SEASONS.spring;

    // enable all season options
    Object.values(SEASONS).forEach((season) => {
        season_of_move_select.querySelector(`input[value="${season}"]`).disabled = false;
    });

    // is player configuring a previous move or making a new one?
    if (configured_move) {
        current_value = configured_move.units;
        season = configured_move.season;
        // the player shouldnt decrease sent units if that'd interfere w later moves
        min_value = move_queue[game.current_player_id]
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

        // TODO disable season options for which there'd be a move w insufficient troops, if this move'd be made then

        if (player_owns_origin) {
            max_value = count_of_units_on_cell_at_season(
                move_queue[game.current_player_id],
                move_origin,
                season,
                move_origin.resources[RESOURCES.people]
            ) - 1;
        } else {
            max_value = count_of_units_on_cell_at_season(
                move_queue[game.current_player_id],
                move_origin,
                season,
            );
        }
    } else {
        current_value = 0;
        min_value = 0;

        if (player_owns_origin) {
            max_value = count_of_units_on_cell_at_season(
                move_queue[game.current_player_id],
                move_origin,
                season,
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

            season = increment_season(season_of_earliest_move_to_origin);
            // FIXME sometimes a follow up allows making more moves than appropriate...ie two 1 unit moves from a cell 1 unit has been moved to
            max_value = count_of_units_on_cell_at_season(
                move_queue[game.current_player_id],
                move_origin,
                season,
            );
        }
    }

    // TODO can this be checked earlier?
    if (max_value <= 0) {
        move_target = null;
        return;
    }

    // configure move_config modal
    season_of_move_select.querySelector(`input[value="${season}"]`).checked = true;
    troop_select_input.value = current_value;
    troop_select_output.value = current_value;
    troop_select_input.max = max_value;
    troop_select_input.min = min_value;
    // show modal
    movement_config.showModal();
}

// TODO this needs to happen when the season in the modal is picked/set to set the max value of the moved units
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
            configured_move.units = sent_troops;
            // update units on arrow
            configured_move.arrow.lastElementChild.lastElementChild.textContent = sent_troops;
        } else {
            move_queue[game.current_player_id].push(
                make_player_move(
                    move_origin,
                    move_target,
                    sent_troops,
                    season_of_move
                )
            );
        }

        move_origin = null;
        move_target = null;
    };
}