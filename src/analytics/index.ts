import * as storage from '@/lib/localStorage'

export type AnalyticsContext = Readonly<Record<string, unknown>>
export type AnalyticsProperties = Readonly<Record<string, unknown>>

interface UserContext {
  gdpr: boolean
  screenWidth: number
  screenHeight: number
  userAgent: string
}

interface EnrichedAnalyticsContext extends AnalyticsContext {
  user: UserContext
}

/** Creates an anonymous user context and tracks actions on a web page. */
export class Analytics {
  readonly _context: AnalyticsContext

  constructor({ context }: { context: AnalyticsContext }) {
    this._context = context
  }

  _getContext(): EnrichedAnalyticsContext {
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

  track(
    eventName: string,
    properties: AnalyticsProperties,
    unique = false
  ): void {
    if (!unique) {
      console.log(`--> Track Event: ${eventName}`, properties, this._getContext())
      return
    }

    const storedEvent = storage.getItem(eventName)
    const trackEvent: unknown = JSON.parse(storedEvent ?? 'null')
    if (!trackEvent) {
      storage.setItem(eventName, true)
      console.log(`--> Track Event: ${eventName}`, properties, this._getContext())
    }
  }

  page(
    pageName: string,
    properties: AnalyticsProperties,
    unique = false
  ): void {
    if (!unique) {
      console.log(`--> Track PageView: ${pageName}`, properties, this._getContext())
      return
    }

    const storedPage = storage.getItem(pageName)
    const pageEvent: unknown = JSON.parse(storedPage ?? 'null')
    if (!pageEvent) {
      storage.setItem(pageName, true)
      console.log(`--> Track PageView: ${pageName}`, properties, this._getContext())
    }
  }
}
