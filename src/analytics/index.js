import * as storage from '../lib/localStorage.js'


/**
 * Analytics class.
 * This class is an essential library to create a context for an anonym user and track the actions in a web page.
 * @module Analytics
 */
export class Analytics {
  /**
  * constructor to set basic user context 
  * @param  {Object} context
  */
  constructor ({context}) {
    this._context = context
  }

  /**
   * Intern method to return context information, add user information.
   * @return {Object}
   */
  _getContext() {
    return {
      ...this._context,
      user: {
        gdpr: true,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent
      }
    }
  }


/**
 * method to track an event with specific params
 * @param  {String} eventName   Event name for the event
 * @param  {String} properties Basic site properties
 * @param  {Boolean} unique Boolean to track only once
 * @return {void}
 */
  track (eventName, properties, unique = false) {
    // if not unique execute the tracking normally 
    if(!unique){
      console.log(`--> Track Event: ${eventName}`, properties, this._getContext())
      return
    }

    const trackEvent = JSON.parse(storage.getItem(eventName))
    if (!trackEvent) {
      storage.setItem(eventName, true)
      console.log(`--> Track Event: ${eventName}`, properties, this._getContext())
    } 
  }

/**
 * method to track an page with specific params
 * @param  {String} pageName   Page name for the event
 * @param  {String} properties Basic site properties
 * @param  {Boolean} unique Boolean to track only once
 * @return {void}
 */
  page (pageName, properties, unique = false) {
    // if not unique execute the tracking normally
    if(!unique) {
      console.log(`--> Track PageView: ${pageName}`, properties, this._getContext())
      return
    }

    const pageEvent = JSON.parse(storage.getItem(pageName))
    if (!pageEvent) {
      storage.setItem(pageName, true)
      console.log(`--> Track PageView: ${pageName}`, properties, this._getContext())
    }
  }
}