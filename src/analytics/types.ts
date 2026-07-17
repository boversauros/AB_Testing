/**
 * Public types of the analytics module.
 *
 * The event describes WHAT happened on the page; the record result describes
 * what analytics DID with it. Everything in between (context enrichment,
 * deduplication, delivery) stays inside the module implementation.
 */

export type AnalyticsProperties = Readonly<Record<string, unknown>>

/** Something that happened on the page, described by the application. */
export interface AnalyticsEvent {
  readonly kind: 'page' | 'interaction'
  readonly name: string
  readonly properties?: AnalyticsProperties
  /** Deliver at most once per visitor; marked only after successful delivery. */
  readonly once?: boolean
}

/**
 * A variant a visitor was exposed to. Structurally matches `Exposure` from
 * the experimentation module; kept as its own type so the two modules stay
 * decoupled.
 */
export interface ExperimentExposure {
  readonly experimentId: string
  readonly variantId: string
}

/** Visitor state the application knows and analytics attaches to every event. */
export interface AnalyticsContext {
  /** Supplied by the application; without consent nothing is delivered. */
  readonly consent: boolean
  readonly exposures: readonly ExperimentExposure[]
  readonly screen?: { readonly width: number; readonly height: number }
  readonly userAgent?: string
}

/** Called on every record so the context is always fresh. */
export type ContextProvider = () => AnalyticsContext

/** What a sink receives: the event enriched with the visitor context. */
export interface OutboundEvent {
  readonly kind: AnalyticsEvent['kind']
  readonly name: string
  readonly properties: AnalyticsProperties
  readonly context: AnalyticsContext
}

/** Delivers events to their destination. Throws when delivery fails. */
export interface AnalyticsSink {
  deliver(event: OutboundEvent): void
}

/** The subset of `window.localStorage` the module needs. */
export interface DeduplicationStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** What analytics did with a recorded event. */
export type RecordResult =
  | { readonly status: 'delivered' }
  | { readonly status: 'duplicate' }
  | { readonly status: 'skipped'; readonly reason: 'consent-not-granted' }
  | { readonly status: 'failed'; readonly reason: string }
