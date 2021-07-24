import * as storage from '../lib/localStorage.js'

export class Analytics {
  constructor ({context}) {
    this._context = context
  }

  _getContext() {
    return {
      ...this._context,
      user: {
        gdpr: false,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent
      }
    }
  }

  track (eventName, properties, unique = false) {
    // if not unique execute the tracking normally 
    if(!unique){
      console.log(`--> Track Event: ${eventName}`, properties, this._getContext())
      return
    }

    const trackEvent = JSON.parse(storage.getItem(eventName))
    if (!trackEvent) {
      storage.setItem(eventName, true);
      console.log(`--> Track Event: ${eventName}`, properties, this._getContext())
    } 
  }

  page (pageName, properties, unique = false) {
    // if not unique execute the tracking normally
    if(!unique) {
      console.log(`--> Track PageView: ${pageName}`, properties, this._getContext())
      return
    }

    const pageEvent = JSON.parse(storage.getItem(pageName))
    if (!pageEvent) {
      storage.setItem(pageName, true);
      console.log(`--> Track PageView: ${pageName}`, properties, this._getContext())
    }
  }
}