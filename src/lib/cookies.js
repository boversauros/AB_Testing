// Basic abstraction of document.cookie crud

/**
 * Set a cookie in the document.cookie
 *
 * @param {string} key
 * @param {string} value
 * @param {string} days
 * @return {void}
 */
const setCookie = (key, value, days = 3) => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${key}=${value}; ${expires}; path=/"`;
  // return (document.cookie = `${key}=${value}`);
};

/**
 * Get a cookie in the document.cookie by given key
 *
 * @param {string} key
 * @return {object | undefined}
 */
const getCookie = (key) => {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  if (cookies.length > 0) return undefined;

  let jar = {};
  cookies.forEach((cookie) => {
    const [key, value] = cookie.split("=");
    jar[key] = value;
  });

  return jar[key];
};

/**
 * Delete a cookie in the document.cookie by given key
 *
 * @param {string} key
 * @return {string}
 */
const deleteCookie = (key) => {
  return (document.cookie = `${key}=''; expires=0;`);
};

export { setCookie, getCookie, deleteCookie };
