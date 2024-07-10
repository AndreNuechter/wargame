import { movement_indicator_tmpl } from '../dom-creations';
import { movement_arrows } from '../dom-selections';

const move_queue = [];

export default move_queue;

export function save_move_queue() {
    localStorage.setItem('wargame-planned-moves', JSON.stringify(
        move_queue.map((player_moves) => player_moves
            .map(({ origin, target, units }) => ({
                origin: { cx: origin.cx, cy: origin.cy },
                target: { cx: target.cx, cy: target.cy },
                units
            }))
        )
    ));
}

export function reapply_move_queue(game) {
    const stored_queue = JSON.parse(localStorage.getItem('wargame-planned-moves'));
    const cells = [...game.board.values()];

    stored_queue.forEach((player_moves) => {
        // reconnect the stored values with the live cells
        move_queue.push(
            player_moves.map(
                ({ origin, target, units }) => make_player_move(
                    cells.find(({ cx, cy }) => cx === origin.cx && cy === origin.cy),
                    cells.find(({ cx, cy }) => cx === target.cx && cy === target.cy),
                    units
                )
            )
        );
    });
}

export function make_player_move(origin, target, units) {
    const arrow = draw_movement_arrow(origin, target, units);

    return {
        origin,
        target,
        units,
        arrow
    };
}

function draw_movement_arrow(origin, target, units) {
    // NOTE: adding half_hex_size to center the path...cx is apparently the upper left corner of the hex's viewBox
    const half_hex_size = 3;
    const path_start = {
        x: origin.cx + half_hex_size,
        y: origin.cy + half_hex_size
    };
    const path_end = {
        x: target.cx + half_hex_size,
        y: target.cy + half_hex_size
    };
    const path_mid = {
        x: (path_end.x + path_start.x) * 0.5,
        y: (path_end.y + path_start.y) * 0.5,
    };
    const movement_indicator = movement_indicator_tmpl.cloneNode(true);
    const sent_units_display = movement_indicator.lastElementChild;

    // TODO start further from the center to not overlay the population count on the cell
    movement_indicator.firstElementChild.setAttribute(
        'd',
        `M${path_start.x} ${path_start.y}L${path_end.x} ${path_end.y}`
    );
    sent_units_display.textContent = units;
    sent_units_display.setAttribute('x', path_mid.x);
    sent_units_display.setAttribute('y', path_mid.y);

    movement_arrows.append(movement_indicator);

    return movement_indicator;
}