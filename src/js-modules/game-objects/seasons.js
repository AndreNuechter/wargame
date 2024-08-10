const SEASONS = {
    spring: 'spring',
    summer: 'summer',
    autumn: 'autumn',
    winter: 'winter'
};

export default SEASONS;

export function increment_season(season) {
    switch (season) {
        case SEASONS.spring:
            return SEASONS.summer;
        case SEASONS.summer:
            return SEASONS.autumn;
        case SEASONS.autumn:
            return SEASONS.winter;
    }
}

/** Is season_a before season_b? */
export function is_season_before(season_a, season_b) {
    if (
        season_a === season_b ||
        season_a === SEASONS.winter ||
        season_a === SEASONS.summer && season_b === SEASONS.spring ||
        season_a === SEASONS.autumn && season_b !== SEASONS.winter
    ) return false;

    return true;
}