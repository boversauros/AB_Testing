// file with utils
import imageURL from '../../images/hero_image.jpg'

/**
 * Set a new listener to an HTMLelement given
 *
 * @param {Object} HTMLelement
 * @param {string} value
 * @param {function} callback
 * @return {void}
 */
const addListener = (HTMLelement, event, callback) => {
    if(typeof HTMLelement !== 'object') throw Error ('HTMLelement should be an object');
    if(typeof event !== 'string') throw Error ('event should be a string');
    if(typeof callback !== 'function') throw Error ('callback should be a function');

    HTMLelement.addEventListener(event, callback)
}

/**
 * Parse image string information
 *
 * @param {string} ImageELement
 * @return {Object}
 */
const imageParser = (ImageElement) => {
    const d = document.createElement('div');
    d.innerHTML = ImageElement;
    const  { firstChild }  = d;
    firstChild.src = imageURL
    return firstChild;
}

export {
    addListener,
    imageParser
}