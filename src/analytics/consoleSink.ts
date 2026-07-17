import type { AnalyticsSink } from './types'

/**
 * A sink that prints events to the console, useful for development and demos.
 * Keeping it here means the analytics logic itself never touches `console`;
 * the composition root decides where events end up.
 */
export const createConsoleSink = (): AnalyticsSink => ({
  deliver: event => {
    console.log(`--> ${event.kind}: ${event.name}`, event.properties, event.context)
  }
})
