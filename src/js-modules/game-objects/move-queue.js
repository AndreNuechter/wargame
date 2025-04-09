import { movement_indicator_tmpl } from '../dom-creations.js';
import { movement_arrows } from '../dom-selections.js';
import storage_keys from './storage-keys.js';

/** @type {Move_Queue} */
const move_queue = [];

export default move_queue;
export {
    clear_move_queue,
    make_player_move,
    reapply_move_queue,
    save_move_queue,
};

/** Empty move_queue and remove all movement indicators. */
function clear_move_queue() {
    move_queue.length = 0;
    movement_arrows.replaceChildren();
}

/**
 * @param {Hex_Cell} origin
 * @param {Hex_Cell} target
 * @param {number} units
 * @param {number} player_id
 * @returns {SVGGElement}
 */
function draw_movement_arrow(origin, target, units, player_id) {
    // TODO how can we better visualize multiple moves from the same origin to the same target? (by different players, since a player can only do a move once a round)
    // NOTE: adding half_hex_size to center the path...cx is apparently the upper left corner of the hex's viewBox
    const half_hex_size = 3;
    // TODO start/end further from the center to not overlay the population count and returing arrow
    const path_start = {
        x: origin.cx + half_hex_size,
        y: origin.cy + half_hex_size,
    };
    const path_end = {
        x: target.cx + half_hex_size,
        y: target.cy + half_hex_size,
    };
    const path_data = `M${path_start.x} ${path_start.y}A 3 3 0 0 0 ${path_end.x} ${path_end.y}`;
    const movement_indicator = /** @type {SVGGElement} */ (movement_indicator_tmpl.cloneNode(true));
    const sent_units_display = movement_indicator.lastElementChild.lastElementChild;

    movement_indicator.firstElementChild.setAttribute('d', path_data);
    movement_indicator.dataset.owner_id = player_id.toString();
    sent_units_display.setAttribute('path', path_data);
    sent_units_display.textContent = units.toString();

    movement_arrows.append(movement_indicator);

    return movement_indicator;
}

/**
 * @param {number} player_id - The id of the player making the move.
 * @param {Hex_Cell} origin - The hex-cell being moved from.
 * @param {Hex_Cell} target - The hex-cell being moved to.
 * @param {Number} units - The number of units sent.
 * @param {Season} season - The season of the move.
 * @param {"settle" | "unspecified"} type - The type of move being made.
 * @returns {Player_Move}
 */
function make_player_move(player_id, origin, target, units, season, type = 'unspecified') {
    const arrow = draw_movement_arrow(origin, target, units, player_id);
    let _units = units;

    return {
        player_id,
        origin,
        target,
        season,
        get units() {
            return _units;
        },
        set units(value) {
            _units = value;
            // update units on arrow
            arrow.lastElementChild.lastElementChild.textContent = value.toString();
        },
        type,
        arrow,
    };
}

/**
 * @param {Game} game
 */
function reapply_move_queue(game) {
    const stored_queue = JSON.parse(localStorage.getItem(storage_keys.move_queue));
    const cells = [...game.board.values()];

    move_queue.push(
        // reconnect the stored values with the live cells
        ...stored_queue.map(
            ({
                player_id, origin, target, units, season,
            }) => make_player_move(
                player_id,
                cells.find(({ cx, cy }) => cx === origin.cx && cy === origin.cy),
                cells.find(({ cx, cy }) => cx === target.cx && cy === target.cy),
                units,
                season,
            ),
        ),
    );
}

/** Save move_queue to localStorage. */
function save_move_queue() {
    localStorage.setItem(storage_keys.move_queue, JSON.stringify(
        move_queue.map(({
            player_id, origin, target, units, season,
        }) => ({
            player_id,
            origin: { cx: origin.cx, cy: origin.cy },
            target: { cx: target.cx, cy: target.cy },
            units,
            season,
        })),
    ));
}