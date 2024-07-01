import game from './game-objects/game.js';
import make_player from './game-objects/player.js';
import { reinstate_hex_map } from './hex-grid/hex-grid.js';

export default function save_game() {
    // prevent saving incomplete state (ie when closing page while still in the game_config_form)
    if (game.players.length === 0) {
        localStorage.removeItem('wargame-savegame');
        return;
    }

    localStorage.setItem(
        'wargame-savegame',
        JSON.stringify({
            round: game.round,
            current_phase: game.current_phase,
            current_player_id: game.current_player_id,
            players: game.players.map(({ name, type }) => ({ name, type })),
            board: [...game.board.values()]
                .map(({
                    cx, cy, x, y, q, r, s,
                    biome: { name },
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
                    biome_name: name,
                    elevation,
                    humidity,
                    temperature,
                    owner_id,
                    resources
                }))
        })
    );
}

export function apply_savegame(game, game_data) {
    const previous_game = JSON.parse(game_data);

    Object.assign(game, {
        round: previous_game.round,
        current_phase: previous_game.current_phase,
        current_player_id: previous_game.current_player_id,
        players: previous_game.players.map(({ name, type }, id) => make_player(id, name, type)),
        board: reinstate_hex_map(previous_game.board, game.board)
    });

    // give players their cells
    game.players.forEach((player, id) => {
        player.cells = [...game.board.values()].filter((cell) => cell.owner_id === id);
    });
}