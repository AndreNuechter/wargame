import {
    movement_config,
    season_of_move_select,
    settle_cell_toggle,
    troop_select_input,
    troop_select_max_value,
    troop_select_min_value,
    troop_select_output,
} from '../../dom-selections.js';
import BIOMES from '../../map-generation/biomes.js';
import move_queue, { make_player_move } from '../move-queue.js';
import RESOURCES from '../resources.js';
import SEASONS, { increment_season, is_season_before } from '../seasons.js';

// TODO enable settling an encampment created in an earlier round

/** @type {Hex_Cell} */
let move_origin = null;
/** @type {Hex_Cell} */
let move_target = null;

export { click_on_cell_action, plan_move };

/**
 * @param {Hex_Cell} hex_obj
 * @param {Game} game
 */
function click_on_cell_action(hex_obj, game) {
    // player picked origin
    if (move_origin === null) {
        set_move_origin(hex_obj, game);

        return;
    }

    // rm highlight from targeted cell
    hex_obj.cell.classList.remove('clicked');

    // did the player unselect the origin?
    if (move_origin === hex_obj) {
        move_origin = null;

        return;
    }

    // player can only move to a neighboring cell
    if (!hex_obj.neighbors.includes(move_origin)) return;

    move_target = hex_obj;

    // NOTE: to maintain visibility of the arrows, the player can only move one time from one specific cell to another during a round and clicking such a combination lets the player configure that move
    const configured_move = move_queue.find(
        ({ player_id, origin, target }) =>
            player_id === game.current_player_id &&
            origin === move_origin &&
            target === move_target,
    );
    const player_owns_origin = move_origin.owner_id === game.current_player_id;
    const player_owns_target = move_target.owner_id === game.current_player_id;
    /** @type{Movement_Planning_Form_Config} */
    const form_config = {
        settle_cell: false,
        season: SEASONS.spring,
    };

    // enable all season options
    Object.values(SEASONS).forEach((season) => {
        /** @type {HTMLInputElement} */ (
            season_of_move_select.querySelector(`input[value="${season}"]`)
        ).disabled = false;
    });
    season_of_move_select.inert = false;
    // disallow settling owned cells and water
    settle_cell_toggle.inert = player_owns_target || move_target.biome === BIOMES.sea;
    // TODO limit size of army that can be sent over water (increase number when origin has a harbor)

    // determine appropriate modal config
    if (configured_move) {
        prepare_form_to_configure_move(configured_move, game, player_owns_origin, form_config);
    } else {
        prepare_form_to_make_move(game, player_owns_origin, form_config);
    }

    // if the move turns out to be invalid, unset target and do nothing else
    // TODO can this be checked earlier?
    if (form_config.max_value <= 0) {
        move_target = null;

        return;
    }

    // configure the modal
    /** @type {HTMLInputElement} */ (
        season_of_move_select.querySelector(`input[value="${form_config.season}"]`)
    ).checked = true;
    Object.assign(
        troop_select_input,
        {
            value: form_config.current_value,
            min: form_config.min_value,
            max: form_config.max_value,
        },
    );
    troop_select_output.value = form_config.current_value.toString();
    troop_select_min_value.value = form_config.min_value.toString();
    troop_select_max_value.value = form_config.max_value.toString();
    settle_cell_toggle.checked = form_config.settle_cell;
    // open the modal
    movement_config.showModal();
}

// TODO limit sendable troops by available resources...moving 1 unit costs 1 gold per step (2 over water; 0 inside own territory)...food? people consume 1 food per turn...we'll not consider food here, but give negative effects when starvation occurs, like decreased efficieny or increased chance of revolts...

/**
 * Set up form_config for configuring a move.
 * @param {Player_Move} configured_move
 * @param {Game} game
 * @param {boolean} player_owns_origin
 * @param {Movement_Planning_Form_Config} form_config
 */
function prepare_form_to_configure_move(configured_move, game, player_owns_origin, form_config) {
    const player_moves = move_queue.filter(({ player_id }) => player_id === game.current_player_id);

    form_config.settle_cell = configured_move.type === 'settle';
    form_config.current_value = configured_move.units;
    form_config.season = configured_move.season;
    // the player shouldnt decrease sent units if that'd interfere w later moves
    form_config.min_value = player_moves
        // get all later moves from the target of the configured move
        .filter(
            ({ season: season_of_move, origin }) =>
                is_season_before(configured_move.season, season_of_move) &&
                configured_move.target === origin,
        )
        .reduce((sent_troops, { season, origin, units }) => {
            // a follow up, that wouldnt have enough troops, if this move didnt exist,
            // is dependent and cant be deleted
            // TODO allow reduction if the follow up doesnt entirely depend on this one
            if (
                (count_of_units_on_cell_at_season(
                    player_moves,
                    origin,
                    season,
                    origin.owner_id === game.current_player_id
                        ? origin.resources[RESOURCES.people]
                        : 0,
                ) - configured_move.units) < units
            ) {
                sent_troops += units;
            }

            return sent_troops;
        }, 0);

    // TODO disable season options for which there'd be a move w insufficient troops, if this move'd be made then...for now we just disable it
    season_of_move_select.inert = true;
    // TODO allow player to toggle this, when appropriate
    settle_cell_toggle.inert = true;

    if (player_owns_origin) {
        form_config.max_value = count_of_units_on_cell_at_season(
            player_moves,
            move_origin,
            form_config.season,
            move_origin.resources[RESOURCES.people],
        ) - 1 + form_config.current_value;
    } else {
        form_config.max_value = count_of_units_on_cell_at_season(
            player_moves,
            move_origin,
            form_config.season,
            game.active_player.get_encampment(move_origin) || 0,
        ) - Number(form_config.settle_cell) + form_config.current_value;
    }
}

/**
 * Set up form_config for making a new move.
 * @param {Game} game
 * @param {boolean} player_owns_origin
 * @param {Movement_Planning_Form_Config} form_config
 * @returns {Season}
 */
function prepare_form_to_make_move(game, player_owns_origin, form_config) {
    const player_moves = move_queue.filter(({ player_id }) => player_id === game.current_player_id);

    form_config.current_value = 0;
    form_config.min_value = 0;

    if (player_owns_origin) {
        form_config.max_value = count_of_units_on_cell_at_season(
            player_moves,
            move_origin,
            form_config.season,
            move_origin.resources[RESOURCES.people],
        ) - 1;
    } else {
        const moves_to_origin = player_moves
            .filter(({ target }) => target === move_origin);

        // is the origin an encampment from an earlier round?
        if (moves_to_origin.length > 0) {
            const season_of_earliest_move_to_origin = moves_to_origin
                .reduce((earliest_season, { season: season_of_move_to_origin }) => {
                    if (is_season_before(season_of_move_to_origin, earliest_season)) {
                        // @ts-ignore
                        earliest_season = season_of_move_to_origin;
                    }

                    return earliest_season;
                }, SEASONS.winter);
            const player_wants_to_settle_origin = player_moves.some(
                ({ target, type, season }) =>
                    target === move_origin &&
                    season === season_of_earliest_move_to_origin &&
                    type === 'settle',
            );

            // do nothing if the earliest move to the origin happened in winter
            // TODO what if there's an encampment from earlier at this point?
            if (season_of_earliest_move_to_origin === SEASONS.winter) {
                move_target = null;

                return;
            }

            // disable season options before the earliest move to the origin
            Object.values(SEASONS)
                .filter((season) =>
                    season === season_of_earliest_move_to_origin ||
                    is_season_before(season, season_of_earliest_move_to_origin),
                )
                .forEach((season) => {
                    /** @type {HTMLInputElement} */ (
                        season_of_move_select.querySelector(`input[value="${season}"]`)
                    ).disabled = true;
                });

            // set season to the one after that of the earliest move to the origin
            form_config.season = increment_season(season_of_earliest_move_to_origin);
            form_config.max_value = count_of_units_on_cell_at_season(
                player_moves,
                move_origin,
                form_config.season,
                game.active_player.get_encampment(move_origin) || 0,
            ) - Number(player_wants_to_settle_origin);

            return;
        }

        form_config.season = SEASONS.spring;
        form_config.max_value = count_of_units_on_cell_at_season(
            player_moves,
            move_origin,
            form_config.season,
            game.active_player.get_encampment(move_origin) || 0,
        );
    }
}

/**
 * @param {Hex_Cell} hex_obj
 * @param {Game} game
 */
function set_move_origin(hex_obj, game) {
    const player_moves = move_queue.filter(({ player_id }) => player_id === game.current_player_id);
    // player cant abandon owned cells and therefore has to leave at least one unit behind when moving from there
    const player_owns_cell_and_its_population_is_big_enough =
        hex_obj.owner_id === game.current_player_id &&
        hex_obj.resources[RESOURCES.people] > 1;
    const player_has_moved_from_here_before = player_moves
        .find(({ origin }) => origin === hex_obj);
    // a player cant make a follow up move, if the move leading here was made in winter
    const player_could_move_on_from_here = player_moves
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
/**
 * @param {Player_Move[]} player_moves
 * @param {Hex_Cell} cell
 * @param {Season} season_in_question
 * @param {number} initial_count
 * @returns {number}
 */
function count_of_units_on_cell_at_season(
    player_moves,
    cell,
    season_in_question,
    initial_count = 0,
) {
    return player_moves
        .filter(
            ({ origin, target, season: season_of_move }) =>
                (origin === cell || target === cell) &&
                (
                    season_of_move === season_in_question ||
                    is_season_before(season_of_move, season_in_question)
                ),
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
            initial_count,
        );
}

/**
 * Return a handler for closing the move_planning overlay.
 * @param {Game} game
 * @returns {() => void}
 */
function plan_move(game) {
    return () => {
        const season_of_move = /** @type {Season} */(/** @type {HTMLInputElement} */ (movement_config.querySelector('[name="season-of-move"]:checked')).value);
        const sent_troops = Number(troop_select_input.value);
        const settle_target_cell = settle_cell_toggle.checked;
        const configured_move_index = move_queue
            .findIndex(({ player_id, origin, target }) =>
                player_id === game.current_player_id &&
                origin === move_origin &&
                target === move_target,
            );

        // zero or invalid input dismisses the move
        if (Number.isNaN(sent_troops) || sent_troops <= 0) {
            move_origin = null;
            move_target = null;

            // rm move from queue and arrow from dom
            if (configured_move_index > -1) {
                const [{ arrow }] = move_queue.splice(configured_move_index, 1);

                arrow.remove();
            }

            return;
        }

        if (configured_move_index > -1) {
            const configured_move = move_queue[configured_move_index];

            // TODO update season
            // TODO update movement type
            configured_move.units = sent_troops;
        } else {
            move_queue.push(
                make_player_move(
                    game.current_player_id,
                    move_origin,
                    move_target,
                    sent_troops,
                    season_of_move,
                    settle_target_cell ? 'settle' : 'unspecified',
                ),
            );
        }

        move_origin = null;
        move_target = null;
    };
}