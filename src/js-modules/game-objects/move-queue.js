import { movement_indicator_tmpl } from '../dom-creations';
import { movement_arrows } from '../dom-selections';
import storage_keys from '../storage-keys';

/** @type {Move_Queue} */
const move_queue = [];

export default move_queue;

export function save_move_queue() {
    localStorage.setItem(storage_keys.move_queue, JSON.stringify(
        move_queue.map(({
            player_id, origin, target, units, season
        }) => ({
            player_id,
            origin: { cx: origin.cx, cy: origin.cy },
            target: { cx: target.cx, cy: target.cy },
            units,
            season
        }))
    ));
}

export function reapply_move_queue(game) {
    const stored_queue = JSON.parse(localStorage.getItem(storage_keys.move_queue));
    const cells = [...game.board.values()];

    move_queue.push(
        // reconnect the stored values with the live cells
        ...stored_queue.map(
            ({
                player_id, origin, target, units, season
            }) => make_player_move(
                player_id,
                cells.find(({ cx, cy }) => cx === origin.cx && cy === origin.cy),
                cells.find(({ cx, cy }) => cx === target.cx && cy === target.cy),
                units,
                season
            )
        )
    );
}

/**
 * @param {number} player_id - The id of the player making the move.
 * @param {Hex_Cell} origin - The hex-cell being moved from.
 * @param {Hex_Cell} target - The hex-cell being moved to.
 * @param {Number} units - The number of units sent.
 * @param {Season} season - The season of the move.
 * @param {Move_Type} type - The type of move being made.
 * @returns {Player_Move}
 */
export function make_player_move(player_id, origin, target, units, season, type = 'unspecified') {
    const arrow = draw_movement_arrow(origin, target, units);

    return {
        player_id,
        origin,
        target,
        season,
        units,
        type,
        arrow
    };
}

// TODO take player_id and color the arrow accordingly
function draw_movement_arrow(origin, target, units) {
    // NOTE: adding half_hex_size to center the path...cx is apparently the upper left corner of the hex's viewBox
    const half_hex_size = 3;
    // TODO start/end further from the center to not overlay the population count and returing arrow
    const path_start = {
        x: origin.cx + half_hex_size,
        y: origin.cy + half_hex_size
    };
    const path_end = {
        x: target.cx + half_hex_size,
        y: target.cy + half_hex_size
    };
    const path_data = `M${path_start.x} ${path_start.y}A 3 3 0 0 0 ${path_end.x} ${path_end.y}`;
    const movement_indicator = /** @type {SVGGElement} */ (movement_indicator_tmpl.cloneNode(true));
    const sent_units_display = movement_indicator.lastElementChild.lastElementChild;

    movement_indicator.firstElementChild.setAttribute('d', path_data);
    sent_units_display.setAttribute('path', path_data);
    sent_units_display.textContent = units;

    movement_arrows.append(movement_indicator);

    return movement_indicator;
}

export function clear_move_queue() {
    move_queue.length = 0;
    movement_arrows.replaceChildren();
}