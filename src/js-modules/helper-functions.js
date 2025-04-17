import { board_element } from './dom-selections.js';

/**
 * Tell whether the given number is even.
 * @param {number} num
 * @returns {boolean}
 */
export function is_even(num) {
    return num % 2 === 0;
}

/**
 * Tell if a number is between two others.
 * @param {number} num
 * @param {number} floor
 * @param {number} ceiling
 * @returns {boolean}
 */
export function is_num_between(num, floor, ceiling) {
    return num >= floor && num <= ceiling;
}

/**
 * Pick a random item from a range of an array.
 * @template T
 * @param {Array<T>} list
 * @param {number} min
 * @param {number} max
 * @returns {T}
 */
export function random_pick(list, min = 0, max = list.length) {
    return list[random_int(max, min)];
}

/**
 * Return a random whole number between two numbers.
 * @param {number} max
 * @param {number} min
 * @returns {number}
 */
export function random_int(max, min = 0) {
    return Math.trunc(Math.random() * (max - min) + min);
}

/**
 * Create a frozen (= the object cant be changed) object wo a prototype based on the argument.
 * @param {object} obj
 * @returns {object}
 */
export function make_frozen_null_obj(obj) {
    return Object.freeze(
        Object.assign(Object.create(null), obj),
    );
}

/**
 * Creates the body of a list of resources and their amount.
 * @param {Resource_Output} resources
 * @returns {HTMLLIElement[]}
 */
export function make_resource_list(resources) {
    return Object
        .entries(resources)
        .map(([resource, value]) => Object.assign(
            document.createElement('li'),
            { textContent: `${resource}: ${value}` },
        ));
}

/**
 * Create a sealed (= no new fields can be added, but the existing fields may be changed) object wo a prototype based on the argument.
 * @param {object} obj
 * @returns {object}
 */
export function make_sealed_null_obj(obj) {
    return Object.seal(
        Object.assign(Object.create(null), obj),
    );
}

/**
 * Create an svg circle and append it to the board.
 * @param {Point} param0
 */
export function mk_svg_point({ x: cx, y: cy }) {
    const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

    point.setAttribute('cx', cx.toString());
    point.setAttribute('cy', cy.toString());
    point.setAttribute('r', '0.5');

    board_element.append(point);

    return point;
}