import { make_frozen_null_obj } from '../helper-functions.js';

/** @type {Humidity_Levels} */
const HUMIDITY_LEVELS = make_frozen_null_obj({
    arid: 'arid',
    dry: 'dry',
    moderate: 'moderate',
    moist: 'moist',
    wet: 'wet',
});

export default HUMIDITY_LEVELS;
export { assign_humidity };

/**
 * @param {Hex_Cell[]} hex_arr
 */
function assign_humidity(hex_arr) {
    // TODO finish me
    // humidity of a land-tile is based on 3 factors:
    // 1. proximity to the sea (tiles adjacent to sea-tiles get +1 level for each)
    hex_arr
        .filter((hex_obj) => hex_obj.elevation > 0)
        .forEach((hex_obj) => {
            hex_obj.neighbors
                .filter((neighboring_hex_obj) => neighboring_hex_obj.elevation === 0)
                .forEach((sea_tile) => {
                    // sea-tiles neighboring land get a different color
                    sea_tile.cell.classList.add('shore');
                    hex_obj.humidity = increase_humidity_level(hex_obj.humidity);
                });
        });

    // 2. aerial humidity (sea-tiles generate humidity in relation to their temperature, which is then blown by wind(!) eastwards, falls on non-sea-tiles (add +1 humidity to them) and is blocked by mountains (wind goes backwards?))

    // 3. humidity of adjacent tiles (tiles adjacent to tiles w humidity > 0 get that level - 1; do we decrease humidity of og?)

    // TODO should temperature and wind influence humidity (carry it off)? rn there's very little dryness...
}

/**
 * @param {Humidity_Level} level
 * @returns {Humidity_Level}
 */
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