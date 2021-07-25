// Basic abstraction of document.localStorage crud

const myStorage = window.localStorage;

/**
 * Set a new localStorage item
 *
 * @param {String} key
 * @param {String} value
 * @return {Void}
 */
const setItem = (key, value) => {
  if (!key || !value) return;

  myStorage.setItem(key, value);
};

/**
 * Get a localStorage item by a given key
 *
 * @param {String} key
 * @return {object | null}
 */
const getItem = (key) => {
  if (!key) return;

  return myStorage.getItem(key);
};

/**
 * Delete an item in the local storage by given key
 *
 * @param {String} key
 * @return {String}
 */
const deleteItem = (key) => {
  if (!key) return;

  return myStorage.removeItem(key);
};

/**
 * Clear all the localStorage set up
 *
 * @return {String}
 */

const clear = () => {
  return myStorage.clear();
};

export { setItem, getItem, deleteItem, myStorage, clear };
