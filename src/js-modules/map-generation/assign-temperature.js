import board_dimensions from './board-dimensions.js';
import { is_num_between } from '../helper-functions.js';

// NOTE: we want our world map to be "freezing" on the poles and "hot" along the equator
// between those two points we move along a scale w the three values "warm", "temperate" and "cold"
const TEMPERATURES = {
    freezing: 'freezing',
    cold: 'cold',
    temperate: 'temperate',
    warm: 'warm',
    hot: 'hot'
};

export default TEMPERATURES;

export { assign_temperature, decrease_temperature, increase_temperature };

function assign_temperature(hex_arr) {
    hex_arr.forEach((hex_obj) => {
        const random_num = Math.random();
        // add bias to mimick axial tilt
        const bias = -1;
        // add some random noise
        const noise = is_num_between(random_num, 0.3, 0.7)
            ? 0
            : 1 * (-1 * Number(random_num < 0.3));
        // add bias and noise to hexes height while staying inside the bounds of the map
        const hex_relative_height = ((value) => {
            if (value < 0) return 0;
            if (value > board_dimensions.height - 1) return board_dimensions.height - 1;
            return value;
        })(hex_obj.y + noise + bias);

        hex_obj.temperature = get_temperature(hex_relative_height);
    });
}

// TODO derive ranges programmatically
function get_temperature(hex_relative_height) {
    switch (hex_relative_height) {
        case 0:
        case 1:
        case board_dimensions.height - 2:
        case board_dimensions.height - 1:
            return TEMPERATURES.freezing;
        case 2:
        case 3:
        case board_dimensions.height - 4:
        case board_dimensions.height - 3:
            return TEMPERATURES.cold;
        case 4:
        case 5:
        case board_dimensions.height - 6:
        case board_dimensions.height - 5:
            return TEMPERATURES.temperate;
        case 6:
        case 7:
        case 8:
        case board_dimensions.height - 9:
        case board_dimensions.height - 8:
        case board_dimensions.height - 7:
            return TEMPERATURES.warm;
        default:
            return TEMPERATURES.hot;
    }
}

function decrease_temperature(temperature) {
    switch (temperature) {
        case TEMPERATURES.hot:
            return TEMPERATURES.warm;
        case TEMPERATURES.warm:
            return TEMPERATURES.temperate;
        case TEMPERATURES.temperate:
            return TEMPERATURES.cold;
        default:
            return TEMPERATURES.freezing;
    }
}

function increase_temperature(temperature) {
    switch (temperature) {
        case TEMPERATURES.freezing:
            return TEMPERATURES.cold;
        case TEMPERATURES.cold:
            return TEMPERATURES.temperate;
        case TEMPERATURES.temperate:
            return TEMPERATURES.warm;
        default:
            return TEMPERATURES.hot;
    }
}