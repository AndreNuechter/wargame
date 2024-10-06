import { defs } from './dom-selections.js';

export const cell_group_tmpl = defs.querySelector('.cell-wrapper');
export const movement_indicator_tmpl = /** @type {SVGGElement} */ (defs.querySelector('.movement-indicator'));
export const player_border_path = defs.querySelector('.player-border');
export const player_config_tmpl = /** @type {HTMLTemplateElement} */ (document.getElementById('player-config-tmpl')).content;
export const structure_builder_tmpl = /** @type {HTMLTemplateElement} */ (document.getElementById('structure-builder-tmpl')).content;