import { make_frozen_null_obj } from '../helper-functions.js';

/** @type {Seasons} */
const SEASONS = make_frozen_null_obj({
    spring: 'spring',
    summer: 'summer',
    autumn: 'autumn',
    winter: 'winter'
});

export default SEASONS;
export {
    increment_season,
    is_season_before
};

function increment_season(season) {
    switch (season) {
        case SEASONS.spring:
            return SEASONS.summer;
        case SEASONS.summer:
            return SEASONS.autumn;
        case SEASONS.autumn:
            return SEASONS.winter;
        default:
            return SEASONS.spring;
    }
}

/** Is season_a before season_b? */
function is_season_before(season_a, season_b) {
    return !(
        season_a === season_b ||
        season_a === SEASONS.winter ||
        season_a === SEASONS.summer && season_b === SEASONS.spring ||
        season_a === SEASONS.autumn && season_b !== SEASONS.winter
    );
}