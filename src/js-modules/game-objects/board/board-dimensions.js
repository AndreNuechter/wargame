import { board, board_size_select } from '../../dom-selections';
import { make_sealed_null_obj } from '../../helper-functions';
import storage_keys from '../storage-keys';

const board_dimensions = make_sealed_null_obj({ width: 0, height: 0 });
const board_sizes = {
    s: { width: 30, height: 24, cell_count: 720, viewBox: '0 0 185 110' },
    m: { width: 60, height: 48, cell_count: 2880, viewBox: '0 0 370 220' },
    l: { width: 90, height: 72, cell_count: 6480, viewBox: '0 0 740 440' },

};

export default board_dimensions;
export {
    initialize_board_dimensions,
    save_board_dimensions,
    set_board_dimensions
};

function board_size_to_board_dimensions({ width, height }) {
    return {
        width,
        height
    };
}

function initialize_board_dimensions() {
    const size_saved_earlier = JSON.parse(localStorage.getItem(storage_keys.board_dimensions));

    if (size_saved_earlier !== null) {
        // if there's a saved value, use that and set the select to the corresponding key
        Object.assign(
            board_dimensions,
            size_saved_earlier
        );

        board_size_select.value = Object
            .keys(board_sizes)
            .find((key) => board_sizes[key].width === board_dimensions.width);
    } else {
        // else set the board_dimensions to the value set in the select (which might be the default)
        const size_configured_in_ui = board_size_select.value;

        Object.assign(
            board_dimensions,
            board_size_to_board_dimensions(board_sizes[size_configured_in_ui])
        );
    }

    // set the board's viewbox accordingly
    board.setAttribute('viewBox', board_sizes[board_size_select.value].viewBox);
}

function save_board_dimensions() {
    localStorage.setItem(storage_keys.board_dimensions, board_dimensions);
}

function set_board_dimensions() {
    const size = board_size_select.value;

    Object.assign(board_dimensions, board_size_to_board_dimensions(board_sizes[size]));
    board.setAttribute('viewBox', board_sizes[size].viewBox);
}