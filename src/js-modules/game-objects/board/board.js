import { reinstate_hex_map } from './hex-grid';

const board = new Map;
const localStorage_key = 'wargame-board';

export default board;

// TODO structures and developable_land arent saved yet
export function save_board() {
    localStorage.setItem(localStorage_key, JSON.stringify(
        [...board.values()]
            .map(({
                cx, cy, x, y, q, r, s,
                biome: { name: biome_name },
                elevation,
                humidity,
                temperature,
                owner_id,
                resources
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
                resources
            }))
    ));
}

export function reapply_board(game) {
    const stored_board = JSON.parse(localStorage.getItem(localStorage_key));
    reinstate_hex_map(stored_board, board);

    // TODO mv this out
    // give players their cells
    game.players.forEach((player, id) => {
        player.cells = [...game.board.values()].filter((cell) => cell.owner_id === id);
    });
}