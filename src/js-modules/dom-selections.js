export const add_player_btn = document.getElementById('add-player-btn');
export const board = document.getElementById('board');
export const bottom_bar = document.getElementById('bottom-bar');
export const cell_info = document.getElementById('cell-info');
export const cell_debug_info = document.getElementById('cell-debug-info');
export const cell_production_forecast = document.getElementById('cell-production-forecast');
export const coord_system_toggle_btn = document.getElementById('toggle-coord-system-btn');
export const config_game_form = document.getElementById('config-game-form');
export const defs = document.getElementById('defs');
export const end_turn_btn = document.getElementById('end-turn-btn');
export const general_info = document.getElementById('general-info');
export const overall_production_forecast = document.getElementById('overall-production-forecast');
export const phase_label = document.getElementById('phase-label');
export const player_configs = document.getElementsByClassName('player-config');
export const player_name = document.getElementById('player-name');
export const player_setup = document.getElementById('player-setup');
export const reroll_map_btn = document.getElementById('reroll-map-btn');
export const side_bar = document.getElementById('side-bar');
export const round_info = document.getElementById('round-info');
export const season_of_move_select = document.getElementById('season-of-move-select');
export const selection_highlight = document.getElementById('selection-highlight');
export const start_game_form = document.getElementById('start-game-form');
/** @type {HTMLDialogElement} */
export const start_game_overlay = document.getElementById('start-game-overlay');
export const movement_arrows = document.getElementById('movement-arrows');
/** @type {HTMLDialogElement} */
export const movement_config = document.getElementById('movement-config');
/** @type {HTMLInputElement} */
export const troop_select_input = movement_config.querySelector('[name="troop-strength"]');
/** @type {HTMLOutputElement} */
export const troop_select_output = movement_config.querySelector('[name="troop-strength-value"]');
export const troop_select_min_value = movement_config.querySelector('[name="min-troop-strength-value"]');
export const troop_select_max_value = movement_config.querySelector('[name="max-troop-strength-value"]');
export const settle_cell_toggle = movement_config.querySelector('[name="settle-cell-toggle"]');