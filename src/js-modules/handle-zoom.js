import { board_element } from './dom-selections.js';

export default handle_zoom;

/**
 * A handler for clicks on the zoom btns.
 * @param {Event} param0
 */
function handle_zoom({ target }) {
    // TODO rethink zoom...btn placement sucks, limit to 3 lvls [farthest out: show entire map; middle: ???; closest: show a cell large enough to see all details] w ea lvl showing different bits of information on cell [closest: pop. split by class; middle: ???; farthest out: just outline, maybe region filled by player color]
    // also when and how to show numbers on mv arrows...
    if (!(target instanceof Element)) return;

    const clicked_btn = target.closest('button');

    if (clicked_btn === null) return;

    const current_zoom_level = Number(board_element.dataset.zoom_level);

    if (clicked_btn.id === 'zoom-in') {
        if (current_zoom_level === 1) return;

        board_element.dataset.zoom_level = (current_zoom_level + 1).toString();
    } else {
        if (current_zoom_level === -1) return;

        board_element.dataset.zoom_level = (current_zoom_level - 1).toString();
    }
}