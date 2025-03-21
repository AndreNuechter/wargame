import game from './game.js';
import storage_keys from './storage-keys.js';

// TODO mv this into game.js

export default save_game;
export {
    apply_savegame,
    delete_savegame
};

function apply_savegame(game, game_data) {
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

function delete_savegame() {
    Object.values(storage_keys)
        .forEach((key) => localStorage.removeItem(key));
}

function save_game() {
    localStorage.setItem(
        storage_keys.game,
        JSON.stringify({
            round: game.round,
            current_phase: game.current_phase,
            current_player_id: game.current_player_id,
        })
    );
}