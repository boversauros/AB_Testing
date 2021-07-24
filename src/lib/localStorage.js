// Basic abstraction of document.localStorage crud

const myStorage = window.localStorage;

/**
 * Set a new localStorage item
 *
 * @param {string} key
 * @param {string} value
 * @return {void}
 */
const setItem = (key, value) => {
  if (typeof myStorage === "undefined") return;
  if (!key || !value) return;

  myStorage.setItem(key, value);
};

/**
 * Get a localStorage item by a given key
 *
 * @param {string} key
 * @return {object | undefined}
 */
const getItem = (key) => {
  if (typeof myStorage === "undefined") return;
  if (!key) return;

  return myStorage.getItem(key);
};

/**
 * Delete an item in the local storage by given key
 *
 * @param {string} key
 * @return {string}
 */
const deleteItem = (key) => {
  if (typeof myStorage === "undefined") return;
  if (!key) return;

  return myStorage.removeItem(key);
};

/**
 * Clear all the localStorage set up
 *
 * @return {string}
 */

const clear = () => {
  return myStorage.clear();
};

export { setItem, getItem, deleteItem, myStorage, clear };
