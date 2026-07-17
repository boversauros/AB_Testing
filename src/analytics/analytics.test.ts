import { describe, expect, it } from 'vitest'
import { createAnalytics, createConsoleSink } from '@/analytics'
import type {
  AnalyticsContext,
  AnalyticsSink,
  DeduplicationStorage,
  OutboundEvent
} from '@/analytics'

const createMemoryStorage = (
  initial: Record<string, string> = {}
): DeduplicationStorage => {
  const entries = new Map(Object.entries(initial))
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value)
    }
  }
}

const createRecordingSink = (): {
  sink: AnalyticsSink
  delivered: OutboundEvent[]
} => {
  const delivered: OutboundEvent[] = []
  return {
    sink: {
      deliver: event => {
        delivered.push(event)
      }
    },
    delivered
  }
}

const createFailingSink = (message: string): AnalyticsSink => ({
  deliver: () => {
    throw new Error(message)
  }
})

const visitorContext: AnalyticsContext = {
  consent: true,
  exposures: [{ experimentId: 'hero', variantId: 'control' }]
}

describe('createAnalytics', () => {
  it('delivers an event enriched with the visitor context and exposures', () => {
    const { sink, delivered } = createRecordingSink()
    const analytics = createAnalytics({
      context: () => visitorContext,
      storage: createMemoryStorage(),
      sink
    })

    const result = analytics.record({
      kind: 'page',
      name: 'Home Viewed',
      properties: { url: 'https://example.test/' }
    })

    expect(result).toEqual({ status: 'delivered' })
    expect(delivered).toEqual([
      {
        kind: 'page',
        name: 'Home Viewed',
        properties: { url: 'https://example.test/' },
        context: visitorContext
      }
    ])
  })

  it('delivers omitted properties as an empty object', () => {
    const { sink, delivered } = createRecordingSink()
    const analytics = createAnalytics({
      context: () => visitorContext,
      storage: createMemoryStorage(),
      sink
    })

    analytics.record({ kind: 'interaction', name: 'Sign Up' })

    expect(delivered[0]?.properties).toEqual({})
  })

  it('delivers repeatable events every time without touching storage', () => {
    const { sink, delivered } = createRecordingSink()
    const storage = createMemoryStorage()
    const analytics = createAnalytics({
      context: () => visitorContext,
      storage,
      sink
    })

    const first = analytics.record({ kind: 'page', name: 'Home Viewed' })
    const second = analytics.record({ kind: 'page', name: 'Home Viewed' })

    expect(first.status).toBe('delivered')
    expect(second.status).toBe('delivered')
    expect(delivered).toHaveLength(2)
    expect(storage.getItem('ab-testing:analytics:v1:page:Home Viewed')).toBeNull()
  })

  it('delivers a once-only event a single time and reports the duplicate', () => {
    const { sink, delivered } = createRecordingSink()
    const analytics = createAnalytics({
      context: () => visitorContext,
      storage: createMemoryStorage(),
      sink
    })
    const signUp = { kind: 'interaction', name: 'Sign Up', once: true } as const

    const first = analytics.record(signUp)
    const second = analytics.record(signUp)

    expect(first).toEqual({ status: 'delivered' })
    expect(second).toEqual({ status: 'duplicate' })
    expect(delivered).toHaveLength(1)
  })

  it('keeps once-only events deduplicated across analytics instances', () => {
    const storage = createMemoryStorage()
    const signUp = { kind: 'interaction', name: 'Sign Up', once: true } as const

    const firstVisit = createAnalytics({
      context: () => visitorContext,
      storage,
      sink: createRecordingSink().sink
    })
    firstVisit.record(signUp)

    expect(
      storage.getItem('ab-testing:analytics:v1:interaction:Sign Up')
    ).toBe('delivered')

    const secondVisit = createAnalytics({
      context: () => visitorContext,
      storage,
      sink: createRecordingSink().sink
    })

    expect(secondVisit.record(signUp)).toEqual({ status: 'duplicate' })
  })

  it('keeps a once-only event retryable after the sink fails', () => {
    const storage = createMemoryStorage()
    const signUp = { kind: 'interaction', name: 'Sign Up', once: true } as const

    const failing = createAnalytics({
      context: () => visitorContext,
      storage,
      sink: createFailingSink('network down')
    })

    expect(failing.record(signUp)).toEqual({
      status: 'failed',
      reason: 'network down'
    })

    const { sink, delivered } = createRecordingSink()
    const working = createAnalytics({
      context: () => visitorContext,
      storage,
      sink
    })

    expect(working.record(signUp)).toEqual({ status: 'delivered' })
    expect(delivered).toHaveLength(1)
  })

  it('skips events without consent and leaves no trace', () => {
    const { sink, delivered } = createRecordingSink()
    const storage = createMemoryStorage()
    const analytics = createAnalytics({
      context: () => ({ consent: false, exposures: [] }),
      storage,
      sink
    })

    const result = analytics.record({
      kind: 'interaction',
      name: 'Sign Up',
      once: true
    })

    expect(result).toEqual({ status: 'skipped', reason: 'consent-not-granted' })
    expect(delivered).toHaveLength(0)
    expect(storage.getItem('ab-testing:analytics:v1:interaction:Sign Up')).toBeNull()
  })

  it('deduplicates a page and an interaction with the same name independently', () => {
    const { sink, delivered } = createRecordingSink()
    const analytics = createAnalytics({
      context: () => visitorContext,
      storage: createMemoryStorage(),
      sink
    })

    const asPage = analytics.record({ kind: 'page', name: 'Welcome', once: true })
    const asInteraction = analytics.record({
      kind: 'interaction',
      name: 'Welcome',
      once: true
    })

    expect(asPage).toEqual({ status: 'delivered' })
    expect(asInteraction).toEqual({ status: 'delivered' })
    expect(delivered).toHaveLength(2)
  })

  it('ignores legacy raw-name keys left over from the previous schema', () => {
    const analytics = createAnalytics({
      context: () => visitorContext,
      storage: createMemoryStorage({ 'Sign Up': 'true' }),
      sink: createRecordingSink().sink
    })

    const result = analytics.record({
      kind: 'interaction',
      name: 'Sign Up',
      once: true
    })

    expect(result).toEqual({ status: 'delivered' })
  })

  it('returns frozen results', () => {
    const analytics = createAnalytics({
      context: () => visitorContext,
      storage: createMemoryStorage(),
      sink: createRecordingSink().sink
    })

    const result = analytics.record({ kind: 'page', name: 'Home Viewed' })

    expect(Object.isFrozen(result)).toBe(true)
  })
})

describe('createConsoleSink', () => {
  it('logs the event without throwing', () => {
    const sink = createConsoleSink()

    expect(() =>
      sink.deliver({
        kind: 'page',
        name: 'Home Viewed',
        properties: {},
        context: visitorContext
      })
    ).not.toThrow()
  })
})
