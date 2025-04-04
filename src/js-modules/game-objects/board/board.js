import storage_keys from '../storage-keys';
import { reinstate_hex_map } from './hex-grid';

const board = new Map;

export default board;
export {
    save_board,
    reapply_board,
};

// TODO structures and developable_land arent saved yet
/** Save board to localStorage. */
function save_board() {
    localStorage.setItem(storage_keys.board, JSON.stringify(
        [...board.values()]
            .map(({
                cx, cy, x, y, q, r, s,
                biome: { name: biome_name },
                elevation,
                humidity,
                temperature,
                owner_id,
                resources,
            }) => ({
                cx,
                cy,
                x,
                y,
                q,
                r,
                s,
                biome_name,
                elevation,
                humidity,
                temperature,
                owner_id,
                resources,
            })),
    ));
}

/** Load board from localStorage and render it. */
function reapply_board() {
    const stored_board = JSON.parse(localStorage.getItem(storage_keys.board));

    reinstate_hex_map(stored_board, board);
}