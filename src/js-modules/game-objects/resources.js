import { make_frozen_null_obj } from '../helper-functions.js';

// NOTE resource storage is tied to cell to allow plundering, but all but people, are pooled
const RESOURCES = make_frozen_null_obj({
    people: 'people', // population of cell grows ea round, as long as theres food, by 0-2, for every pair of people; if food is not enough, population decreases and chance of uprisings (no taxes, destruction of structures, no soldiers...) rises. needed for resource production (besides that of people), can be turned into soldiers.
    gold: 'gold', // gained by taxing population. taxation may increase chance of uprising. used for moving soldiers
    cloth: 'cloth', // gained passively from cell and actively thru textile_factory. used for housing
    wood: 'wood', // cell, lumber_mills. housing, soldiers
    stone: 'stone', // cell, quarry. housing, soldiers
    iron: 'iron', // forge. soldiers, housing
    food: 'food', // cell, farm. used by pop
    alcohol: 'alcohol', // distillery. lowers chance of uprisings
});

export default RESOURCES;
export const initial_resources = make_frozen_null_obj({
    [RESOURCES.people]: 5,
    [RESOURCES.gold]: 5,
    [RESOURCES.cloth]: 25,
    [RESOURCES.wood]: 25,
    [RESOURCES.stone]: 25,
    [RESOURCES.iron]: 0,
    [RESOURCES.food]: 50,
    [RESOURCES.alcohol]: 5
});