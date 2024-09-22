import game from './game-objects/game.js';

const localStorage_key = 'wargame-savegame';

export default function save_game() {
    // TODO make this more robust?!
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
        })
    );
}

export function apply_savegame(game, game_data) {
    const {
        round,
        current_phase,
        current_player_id
    } = JSON.parse(game_data);

    Object.assign(game, {
        round,
        current_phase,
        current_player_id,
    });
}