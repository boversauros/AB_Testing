import { markDelivered, wasDelivered } from './deduplication'
import type {
  AnalyticsEvent,
  AnalyticsSink,
  ContextProvider,
  DeduplicationStorage,
  RecordResult
} from './types'

export type {
  AnalyticsContext,
  AnalyticsEvent,
  AnalyticsProperties,
  AnalyticsSink,
  ContextProvider,
  DeduplicationStorage,
  ExperimentExposure,
  OutboundEvent,
  RecordResult
} from './types'

export { createConsoleSink } from './consoleSink'

export interface AnalyticsOptions {
  /** Supplies the visitor context attached to every event. */
  readonly context: ContextProvider
  /** Where once-only delivery markers persist, usually `window.localStorage`. */
  readonly storage: DeduplicationStorage
  /** Where enriched events are delivered, e.g. the console sink. */
  readonly sink: AnalyticsSink
}

export interface Analytics {
  /**
   * Enriches the event with the current visitor context and delivers it to
   * the sink, reporting what happened instead of failing silently.
   *
   * Without consent the event is skipped and nothing is stored. Once-only
   * events are marked as delivered only after the sink succeeds, so a failed
   * delivery stays retryable.
   */
  record(event: AnalyticsEvent): RecordResult
}

export const createAnalytics = ({
  context,
  storage,
  sink
}: AnalyticsOptions): Analytics => {
  const record = (event: AnalyticsEvent): RecordResult => {
    const currentContext = context()

    if (!currentContext.consent) {
      return Object.freeze({
        status: 'skipped',
        reason: 'consent-not-granted'
      } as const)
    }

    if (event.once && wasDelivered(storage, event)) {
      return Object.freeze({ status: 'duplicate' } as const)
    }

    try {
      sink.deliver({
        kind: event.kind,
        name: event.name,
        properties: event.properties ?? {},
        context: currentContext
      })
    } catch (error) {
      return Object.freeze({
        status: 'failed',
        reason: error instanceof Error ? error.message : String(error)
      } as const)
    }

    if (event.once) {
      markDelivered(storage, event)
    }

    return Object.freeze({ status: 'delivered' } as const)
  }

  return { record }
}
