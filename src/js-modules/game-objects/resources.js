import { make_frozen_null_obj } from '../helper-functions.js';

// NOTE resource storage is tied to cell to allow plundering, but all are pooled for use (except people for moves)
/** @type {Resources} */
const RESOURCES = make_frozen_null_obj({
    people: 'people', // population of cell grows ea round, as long as theres food, by 0-2, for every pair of people; if food is not enough, population decreases and chance of uprisings (no taxes, destruction of structures, no soldiers...) rises. needed for resource production (besides that of people), can be turned into soldiers.
    gold: 'gold', // gained by taxing population. taxation may increase chance of uprising. used for moving units
    wood: 'wood', // cell, lumber_mills. housing, soldiers
    stone: 'stone', // cell, quarry. housing, soldiers
    iron: 'iron', // forge. soldiers, housing
    food: 'food', // cell, farm. used by pop
    alcohol: 'alcohol', // distillery. lowers chance of uprisings
    coal: 'coal', // mine. used in forge to make iron.
});

export default RESOURCES;
export {
    calculate_resource_production,
    update_player_resources,
};

/**
 * @param {Set<Hex_Cell>} cells
 * @returns {Resource_Output}
 */
function calculate_resource_production(cells, tax_rate = 1) {
    // TODO consider neighboring cell for gatherable resources
    const result = {
        [RESOURCES.gold]: 0,
        [RESOURCES.wood]: 0,
        [RESOURCES.stone]: 0,
        [RESOURCES.iron]: 0,
        [RESOURCES.food]: 0,
        [RESOURCES.alcohol]: 0,
        [RESOURCES.coal]: 0,
    };
    const { total_population, total_required_workers } = [...cells].reduce(
        (result, cell) => {
            result.total_population += cell.resources[RESOURCES.people];
            result.total_required_workers += [...cell.structures.entries()]
                .reduce(
                    (required_workers, [structure, count]) =>
                        required_workers + structure.required_workers * count,
                    0,
                );

            return result;
        },
        { total_population: 0, total_required_workers: 0 },
    );
    // TODO homelessness...iff the player has build a structure...only housed pop helps w res production, pays taxes and can be used for war
    // TODO do we care about unemployment here?
    // we scale down output of structures when there arent enough workers
    const productivity_modifier = Math.min(1.0, total_population / total_required_workers);
    let player_has_settled = false;

    cells.forEach((cell) => {
        // add default production or gatherable resources
        Object.entries(cell.biome.resource_production).forEach(([resource, gain]) => {
            // TODO this shouldnt happen unconditionally...only if there are "free hands". in what volume?
            result[resource] += gain;
        });

        // TODO consume resources needed for production
        // add construction based production
        [...cell.structures.entries()].forEach(([structure, structure_count]) => {
            player_has_settled = structure_count > 0;
            structure.output.forEach(({ resource_name, amount }) => {
                result[resource_name] += Math.trunc(amount * structure_count * productivity_modifier);
            });
        });
    },
    );

    // calculate gold/taxes if the player has build a structure
    if (player_has_settled) {
        result[RESOURCES.gold] = total_population * tax_rate;
    }

    return result;
}

/**
 * @param {Hex_Cell} cell
 */
function increase_population(cell) {
    // TODO scale chances up/down based on how many neighboring cells are inhabited (and other factors like starvation)
    let population_increase = 0;

    // give tiny chance to gain 1 to cells w only 1 inhabitant
    if (cell.resources.people === 1) {
        if (Math.random() < 0.05) {
            population_increase = 1;
        }
    } else {
        const pair_count = Math.trunc(cell.resources.people / 2);

        for (let pair_index = 0; pair_index < pair_count; pair_index += 1) {
            const random_num = Math.random();

            // randomnly give 0 (50%), 1 (40%) or 2 (10%) new people
            if (random_num < 0.1) {
                population_increase += 2;
            } else if (random_num < 0.5) {
                population_increase += 1;
            }
        }
    }

    // TODO introduce additions as children that are counted seperately and need to grow up before being "useful"
    cell.resources[RESOURCES.people] += population_increase;
}

/**
 * Update the resources of the players at the beginning of a new round.
 * @param {Player[]} players
*/
function update_player_resources(players) {
    // TODO come up w a more general solution. a lot of the work here is duplicated above in calculate_resource_production
    players.forEach(
        ({ cells, encampments, tax_rate }) => {
            // TODO handle homelessness (total_pop > total_housing_capacity)...only housed population helps w res production
            const { total_population, total_required_workers } = [...cells].reduce(
                (result, cell) => {
                    result.total_population += cell.resources[RESOURCES.people];
                    result.total_required_workers += [...cell.structures.entries()]
                        .reduce(
                            (required_workers, [structure, count]) =>
                                required_workers + structure.required_workers * count,
                            0,
                        );

                    return result;
                },
                { total_population: 0, total_required_workers: 0 },
            );
            // we scale down output of structures when there arent enough workers
            const productivity_modifier = Math.min(1.0, total_population / total_required_workers);
            // TODO unemployment contributes to unhappiness in the population
            // const unemployment_rate = (total_population - total_required_workers) / total_population;
            // ea person consumes 1 food
            let food_requirement = [...encampments.values()]
                .reduce((result, encamped_units) => result + encamped_units, total_population);

            cells.forEach((cell) => {
                // add default production
                Object.entries(cell.biome.resource_production)
                    .forEach(([resource, gain]) => {
                        cell.resources[resource] += gain;
                    });
                // add building based production
                // TODO consume resources needed for production
                [...cell.structures.entries()]
                    .forEach(([structure, count]) =>
                        structure.output.forEach(({ resource_name, amount }) => {
                            cell.resources[resource_name] += Math.trunc(amount * count * productivity_modifier);
                        }),
                    );
                // collect taxes
                // TODO only if player has build a structure...see above
                // TODO only tax housed and working population
                // TODO high taxes contribute to unhappiness in the population
                cell.resources[RESOURCES.gold] += cell.resources[RESOURCES.people] * tax_rate;

                // consume food
                if (food_requirement > 0) {
                    if (food_requirement >= cell.resources[RESOURCES.food]) {
                        food_requirement -= cell.resources[RESOURCES.food];
                        cell.resources[RESOURCES.food] = 0;
                    } else {
                        cell.resources[RESOURCES.food] -= food_requirement;
                        food_requirement = 0;
                    }
                }

                // TODO consume other resources...wood and coal for heat (c Banished)
                // TODO consume alc to decrease unhappiness!?
                // TODO decay some resources to prevent overstacking?

                // increase population
                increase_population(cell);
            });

            // TODO starvation contributes to unhappiness in the population
            // if (food_requirement > 0) {}
        },
    );
}