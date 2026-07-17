import type { AnalyticsEvent, DeduplicationStorage } from './types'

/**
 * Bump the version when the key format changes so older markers are simply
 * ignored instead of being misread.
 */
const KEY_PREFIX = 'ab-testing:analytics:v1'

/**
 * One storage key per event, namespaced by schema version, kind, and name.
 * The kind segment keeps a page and an interaction with the same name from
 * colliding; the kind is a closed union, so it can never contain `:` itself.
 */
export const deliveryKey = (event: AnalyticsEvent): string =>
  `${KEY_PREFIX}:${event.kind}:${event.name}`

/** Presence of the key means delivered, so corrupt values cannot mislead us. */
export const wasDelivered = (
  storage: DeduplicationStorage,
  event: AnalyticsEvent
): boolean => storage.getItem(deliveryKey(event)) !== null

export const markDelivered = (
  storage: DeduplicationStorage,
  event: AnalyticsEvent
): void => {
  storage.setItem(deliveryKey(event), 'delivered')
}
