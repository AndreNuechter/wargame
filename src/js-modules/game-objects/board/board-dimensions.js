import { board_element, board_size_select } from '../../dom-selections.js';
import { make_sealed_null_obj } from '../../helper-functions.js';
import storage_keys from '../storage-keys.js';

const board_dimensions = make_sealed_null_obj({ width: 0, height: 0 });
const board_sizes = {
    s: { width: 30, height: 24, cell_count: 720, viewBox: '0 0 185 110' },
    m: { width: 60, height: 48, cell_count: 2880, viewBox: '0 0 370 220' },
    l: { width: 90, height: 72, cell_count: 6480, viewBox: '0 0 740 440' },

};

export default board_dimensions;
export {
    change_boardsize,
    initialize_board_dimensions,
    save_board_dimensions,
};

/**
 * @param {object} param0
 * @returns {Board_dimensions}
 */
function board_size_to_board_dimensions({ width, height }) {
    return {
        width,
        height,
    };
}

/**
 * Return a handler for changes of the board size select.
 * @param {Game} param0
 * @param {Function} reroll_map
 * @returns {() => void}
 */
function change_boardsize({ board }, reroll_map) {
    return () => {
        const size = board_size_select.value;

        Object.assign(board_dimensions, board_size_to_board_dimensions(board_sizes[size]));
        board_element.setAttribute('viewBox', board_sizes[size].viewBox);
        reroll_map(board, board_dimensions);
    };
}

/** Load or initialize board_dimensions, set the select's value and the boards viewBox. */
function initialize_board_dimensions() {
    const size_saved_earlier = JSON.parse(
        localStorage.getItem(storage_keys.board_dimensions),
    );

    if (size_saved_earlier === null) {
        // if there's no saved value,
        // set the board_dimensions to the value set in the select
        const size_configured_in_ui = board_size_select.value;

        Object.assign(
            board_dimensions,
            board_size_to_board_dimensions(board_sizes[size_configured_in_ui]),
        );
    } else {
        // else use the saved value and set the select to that key
        Object.assign(
            board_dimensions,
            size_saved_earlier,
        );

        board_size_select.value = Object
            .keys(board_sizes)
            .find((key) => board_sizes[key].width === board_dimensions.width);
    }

    // set the board's viewbox accordingly
    board_element.setAttribute('viewBox', board_sizes[board_size_select.value].viewBox);
}

/** Save board_dimensions to localStorage. */
function save_board_dimensions() {
    localStorage.setItem(storage_keys.board_dimensions, JSON.stringify(board_dimensions));
}