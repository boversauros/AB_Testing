/**
 * Set a new listener to an HTMLelement given
 *
 * @param {Object} HTMLelement
 * @param {String} value
 * @param {Function} callback
 * @return {Void}
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
 * @param {String} ImageELement
 * @return {Object}
 */
const imageParser = (ImageElement, imageURL) => {
    if(typeof ImageElement !== 'string') throw Error ('ImageElement should be an string');
    if(typeof imageURL !== 'string') throw Error ('imageURL should be an string');
    
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