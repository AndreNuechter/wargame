import { main_overlay, player_configs } from './dom-selections';
import board_dimensions from './game-objects/board/board-dimensions';
import { reroll_map } from './game-objects/board/hex-grid';
import game from './game-objects/game';
import { clear_move_queue } from './game-objects/move-queue';
import { make_player, make_player_config } from './game-objects/player';
import ROUND_PHASES from './game-objects/round-phases/round-phases';

export {
    close_main_overlay,
    continue_or_config_new_game,
    open_main_overlay,
    start_game,
};

/** Handler for the close-event of the main-overlay. */
function close_main_overlay() {
    // config a minimal viable game, if that's not yet the case
    if (game.players.length === 0) {
        game.players = Array.from(
            { length: 2 },
            (_, id) => make_player(id, `Player ${id + 1}`, 'human'),
        );
    }

    // rm the class now (and thereby reset the form to its initial state) cuz we might get here wo submitting the config_game_form
    main_overlay.classList.remove('game-config');
    game.run();
}

/**
 * @param {SubmitEvent} param0
 */
function continue_or_config_new_game({ submitter }) {
    if (submitter.id === 'continue-btn') {
        // the continue-btn only works if there's a saved/running game
        if (main_overlay.dataset.gameIsRunning !== 'true') return;

        main_overlay.close();

        return;
    }

    if (submitter.id !== 'new-game-btn') return;

    // if there's a saved/running game or a game just finished, reroll the map, clear move_queue and delete players
    if (
        main_overlay.dataset.gameIsRunning === 'true' ||
        game.current_phase === ROUND_PHASES.game_over.name
    ) {
        Object.assign(game, {
            round: 0,
            current_phase: ROUND_PHASES.land_grab.name,
            current_player_id: 0,
        });
        reroll_map(game.board, board_dimensions);
        clear_move_queue();
        game.clear_players();

        // delete player creation ui elements to prevent duplicates and clear config
        for (const player_config of [...player_configs]) {
            player_config.remove();
        }
    }

    // create 2 player creation ui elements
    Array.from({ length: 2 }, (_, id) => make_player_config(id + 1));

    // switch to game-config
    main_overlay.classList.add('game-config');
}

/** Note whether a game is running and open the main-overlay via the burger-menu btn. */
function open_main_overlay() {
    main_overlay.dataset.gameIsRunning = (
        game.current_phase !== ROUND_PHASES.game_over.name &&
        game.players.length > 0
    ).toString();
    main_overlay.showModal();
}

/** Apply configured options and start the game. */
function start_game() {
    // create players
    Array.from(
        player_configs,
        (player_config, id) => {
            const name = /** @type {HTMLInputElement} */ (player_config.querySelector('.player-name-input')).value;
            const type = /** @type {Player_Type} */ (/** @type {HTMLInputElement} */ (player_config.querySelector('.player-type-select-radio:checked')).value);

            game.players.push(make_player(id, name, type));
        },
    );

    // TODO use other config options

    main_overlay.close();
}