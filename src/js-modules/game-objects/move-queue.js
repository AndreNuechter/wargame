import { movement_indicator_tmpl } from '../dom-creations';
import { movement_arrows } from '../dom-selections';

/** @type {Move_Queue} */
const move_queue = [];
const localStorage_key = 'wargame-planned-moves';

export default move_queue;

export function save_move_queue() {
    localStorage.setItem(localStorage_key, JSON.stringify(
        move_queue.map((player_moves) => player_moves
            .map(({ origin, target, units, season }) => ({
                origin: { cx: origin.cx, cy: origin.cy },
                target: { cx: target.cx, cy: target.cy },
                units,
                season
            }))
        )
    ));
}

export function reapply_move_queue(game) {
    const stored_queue = JSON.parse(localStorage.getItem(localStorage_key));
    const cells = [...game.board.values()];

    stored_queue.forEach((player_moves) => {
        // reconnect the stored values with the live cells
        move_queue.push(
            player_moves.map(
                ({ origin, target, units, season }) => make_player_move(
                    cells.find(({ cx, cy }) => cx === origin.cx && cy === origin.cy),
                    cells.find(({ cx, cy }) => cx === target.cx && cy === target.cy),
                    units,
                    season
                )
            )
        );
    });
}

/**
 * @param {Hex_Cell} origin - The hex-cell being moved from.
 * @param {Hex_Cell} target - The hex-cell being moved to.
 * @param {Number} units - The number of units sent.
 * @param {Season} season - The season of the move.
 * @param {Move_Type} type - The type of move being made.
 * @returns {Player_Move}
 */
export function make_player_move(origin, target, units, season, type) {
    const arrow = draw_movement_arrow(origin, target, units);

    return {
        season,
        origin,
        target,
        units,
        type,
        arrow
    };
}

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
    const movement_indicator = movement_indicator_tmpl.cloneNode(true);
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