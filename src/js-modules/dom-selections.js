export const add_player_btn = document.getElementById('add-player-btn');
export const board_element = document.getElementById('board');
export const board_size_select = /** @type {HTMLSelectElement} */ (document.getElementById('board-size-select'));
export const bottom_bar = document.getElementById('bottom-bar');
export const cell_info = document.getElementById('cell-info');
export const cell_production_forecast = document.getElementById('cell-production-forecast');
export const config_game_form = document.getElementById('config-game-form');
export const defs = document.getElementById('defs');
export const end_turn_btn = document.getElementById('end-turn-btn');
export const general_info = document.getElementById('general-info');
export const total_production_forecast = document.getElementById('total-production-forecast');
export const phase_label = document.getElementById('phase-label');
export const player_configs = document.getElementsByClassName('player-config');
export const player_name = document.getElementById('player-name');
export const player_setup = document.getElementById('player-setup');
export const reroll_map_btn = document.getElementById('reroll-map-btn');
export const side_bar = document.getElementById('side-bar');
export const round_info = document.getElementById('round-info');
export const season_of_move_select = document.getElementById('season-of-move-select');
export const selection_highlight = /** @type {SVGPathElement} */ (
    /** @type {unknown} */ (
        document.getElementById('selection-highlight')
    )
);
export const start_game_form = document.getElementById('start-game-form');
export const main_overlay = /** @type {HTMLDialogElement} */ (document.getElementById('main-overlay'));
export const movement_arrows = document.getElementById('movement-arrows');
export const movement_config = /** @type {HTMLDialogElement} */ (document.getElementById('movement-config'));
export const troop_select_input = /** @type {HTMLInputElement} */ (movement_config.querySelector('[name="troop-strength"]'));
export const troop_select_output = /** @type {HTMLOutputElement} */ (movement_config.querySelector('[name="troop-strength-value"]'));
export const troop_select_min_value = /** @type {HTMLInputElement} */ (movement_config.querySelector('[name="min-troop-strength-value"]'));
export const troop_select_max_value = /** @type {HTMLInputElement} */ (movement_config.querySelector('[name="max-troop-strength-value"]'));
export const settle_cell_toggle = /** @type {HTMLInputElement} */ (movement_config.querySelector('[name="settle-cell-toggle"]'));
export const player_borders_container = document.getElementById('player-borders');
export const player_encampments = document.getElementById('encampments');
export const toggle_menu_btn = document.getElementById('burger-menu-btn');
export const zoom_btns = document.getElementById('zoom-btns');