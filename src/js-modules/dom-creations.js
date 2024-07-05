import { defs } from './dom-selections.js';

export const cell_group_tmpl = defs.querySelector('.cell-wrapper');
export const movement_indicator_tmpl = defs.querySelector('.movement-indicator');
export const path_tmpl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
export const player_border_path = defs.querySelector('.player-border');
export const player_config_tmpl = document.getElementById('player-config-tmpl').content;
export const structure_builder_tmpl = document.getElementById('structure-builder-tmpl').content;