import './js-modules/service-worker/service-worker-init.js';
import './js-modules/service-worker/wakelock.js';
import {
    add_player_btn,
    board_element,
    board_size_select,
    config_game_form,
    end_turn_btn,
    main_overlay,
    movement_config,
    player_setup,
    reroll_map_btn,
    side_bar,
    start_game_form,
    toggle_menu_btn,
    troop_select_input,
    troop_select_output,
    zoom_btns,
} from './js-modules/dom-selections.js';
import board_dimensions, { change_boardsize } from './js-modules/game-objects/board/board-dimensions.js';
import game, { close_window, continue_game_or_open_main_overlay } from './js-modules/game-objects/game.js';
import { end_turn_btn_click_handling } from './js-modules/game-objects/round-phases/round-phases.js';
import { add_player, delete_player } from './js-modules/game-objects/player.js';
import { plan_move } from './js-modules/game-objects/round-phases/movement-planning.js';
import { reroll_map } from './js-modules/game-objects/board/hex-grid.js';
import { select_cell } from './js-modules/game-objects/board/hex-cell.js';
import handle_zoom from './js-modules/handle-zoom.js';
import { close_main_overlay, continue_or_config_new_game, open_main_overlay, start_game } from './js-modules/main-overlay.js';

// TODO rethink what info to show on a cell...
// - info about population like size and makeup (peasants vs soldiers, homeless, jobless, adults/children)
// - info about built structures/type of settlement (eg shantytown, village, city...rural vs urban)
// - info about temporary modifiers like pestilence, starvation, revolt, fire or war
// ...have settlement signified by path around the perimeter (like a skyline), pop by numbers in the middle and temp mods by an icon somewhere on the cell (perhaps below the pop bit)...and think about zoom levels and which level should show what bit of info...
// TODO light theme toggle (in bottom of start_game_overlay)
// TODO divide sidebar content into chunks and make it swipable horizontally (use scroll snap...what on larger screens?)
// TODO in dev phase, empire overview, have list of owned cells w link to them
// TODO add a way to config map gen
// TODO rm movement_modifier from Biome?

window.addEventListener(
    'DOMContentLoaded',
    continue_game_or_open_main_overlay,
    { once: true },
);
document.addEventListener('visibilitychange', close_window);
document.addEventListener('submit', (event) => event.preventDefault());
zoom_btns.addEventListener('click', handle_zoom);
board_size_select.addEventListener('change', change_boardsize(game, reroll_map));
// display configured troop size after input
troop_select_input.addEventListener('input', () => {
    troop_select_output.value = troop_select_input.value;
});
toggle_menu_btn.addEventListener('click', open_main_overlay);
start_game_form.addEventListener('submit', continue_or_config_new_game);
config_game_form.addEventListener('submit', start_game);
main_overlay.addEventListener('close', close_main_overlay);
reroll_map_btn.addEventListener('click', () => reroll_map(game.board, board_dimensions));
add_player_btn.addEventListener('click', add_player);
end_turn_btn.addEventListener('click', end_turn_btn_click_handling(game));
player_setup.addEventListener('click', delete_player);
board_element.addEventListener('click', select_cell(game));
side_bar.addEventListener('input', ({ target }) => {
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name !== 'tax_rate') return;

    game.active_player.tax_rate = Number(target.value);
});
movement_config.addEventListener('close', plan_move(game));
movement_config.addEventListener('submit', () => movement_config.close());