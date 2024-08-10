import SEASONS, { is_season_before } from '../seasons';
import move_queue from '../move-queue';
import { phase_label } from '../../dom-selections';

// TODO find a way to save and continue movement execution

export function* execute_moves() {
    for (const season in SEASONS) {
        const { moves_in_this_season, moves_so_far } = move_queue
            .reduce((result, move) => {
                if (season === move.season) {
                    result.moves_in_this_season.push(move);
                } else if (is_season_before(move.season, season)) {
                    result.moves_so_far.push(move);
                }

                return result;
            }, { moves_in_this_season: [], moves_so_far: [] });

        // hide arrows of earlier moves
        moves_so_far.forEach(({ arrow }) => arrow.removeAttribute('style'));
        // output season in top-bar instead of cta
        phase_label.textContent = `Move(s) in ${season}`;

        for (const move of moves_in_this_season) {
            // show arrow of current move
            move.arrow.style.display = 'initial';

            if (is_move_still_possible(move, moves_so_far)) {
                // TODO handle move...
            } else {
                // TODO delete the move?
            }

            yield move;
        }
    }
}

function is_move_still_possible(move = {}, moves_so_far = []) {
    // TODO impl me
}