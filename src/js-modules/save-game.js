import game from './game-objects/game.js';
import make_player from './game-objects/player.js';

const localStorage_key = 'wargame-savegame';

export default function save_game() {
    // prevent saving incomplete state (ie when closing page while still in the game_config_form)
    if (game.players.length === 0) {
        localStorage.removeItem(localStorage_key);
        return;
    }

    localStorage.setItem(
        localStorage_key,
        JSON.stringify({
            round: game.round,
            current_phase: game.current_phase,
            current_player_id: game.current_player_id,
            // TODO mv this out
            players: game.players.map(({ name, type }) => ({ name, type }))
        })
    );
}

export function apply_savegame(game, game_data) {
    const previous_game = JSON.parse(game_data);

    Object.assign(game, {
        round: previous_game.round,
        current_phase: previous_game.current_phase,
        current_player_id: previous_game.current_player_id,
        // TODO mv this out
        players: previous_game.players.map(({ name, type }, id) => make_player(id, name, type)),
    });
}