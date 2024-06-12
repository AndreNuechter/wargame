import game from './game-objects/game.js';

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
                    population
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
                    population
                }))
        })
    );
}