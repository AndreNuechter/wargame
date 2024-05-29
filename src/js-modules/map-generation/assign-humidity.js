import { BIOMES } from './biomes';

export const HUMIDITY_LEVELS = {
    arid: 'arid',
    dry: 'dry',
    moderate: 'moderate',
    moist: 'moist',
    wet: 'wet'
};

function increase_humidity_level(level) {
    switch (level) {
        case HUMIDITY_LEVELS.arid:
            return HUMIDITY_LEVELS.dry;
        case HUMIDITY_LEVELS.dry:
            return HUMIDITY_LEVELS.moderate;
        case HUMIDITY_LEVELS.moderate:
            return HUMIDITY_LEVELS.moist;
        default:
            return HUMIDITY_LEVELS.wet;
    }
}

export default function assign_humidity(hex_arr) {
    // TODO finish me
    // humidity of a land-tile is based on 3 factors:
    // 1. proximity to the sea (tiles adjacent to sea-tiles get +1 level for each)
    hex_arr
        .filter((hex) => hex.elevation > 0)
        .forEach((hex) => {
            hex.neighbors
                .filter(({ biome }) => biome === BIOMES.sea)
                .forEach(() => {
                    hex.humidity = increase_humidity_level(hex.humidity);
                });
        });

    // 2. aerial humidity (sea-tiles generate humidity in relation to their temperature, which is then blown by wind(!) eastwards, falls on non-sea-tiles (add +1 humidity to them) and is blocked by mountains (wind goes backwards?))

    // 3. humidity of adjacent tiles (tiles adjacent to tiles w humidity > 0 get that level - 1; do we decrease humidity of og?)

    // TODO should temperature and wind influence humidity? rn there's very little dryness...
}