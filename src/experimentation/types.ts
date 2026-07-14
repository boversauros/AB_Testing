/**
 * Public types of the experimentation module.
 *
 * The catalog describes WHAT can be tested; the activation result describes
 * WHAT actually happened. Everything in between (assignment persistence,
 * DOM rendering) stays inside the module implementation.
 */

/** What a variant renders. Extend this union to support new content kinds. */
export type VariantContent =
  | { readonly kind: 'text'; readonly text: string }
  | {
      readonly kind: 'image'
      readonly src: string
      readonly alt: string
      readonly width?: number
    }

export interface ExperimentVariant {
  readonly id: string
  readonly content: VariantContent
}

export interface Experiment {
  readonly id: string
  readonly name: string
  /**
   * Semantic name of the page slot this experiment renders into, resolved
   * against elements marked with a matching `data-placement` attribute.
   */
  readonly placement: string
  readonly variants: readonly ExperimentVariant[]
}

export type ExperimentCatalog = readonly Experiment[]

/** A variant that was assigned AND successfully rendered for this visitor. */
export interface Exposure {
  readonly experimentId: string
  readonly variantId: string
}

/** A non-fatal problem that prevented one experiment from rendering. */
export interface ActivationIssue {
  readonly experimentId: string
  readonly message: string
}

export interface ActivationResult {
  readonly exposures: readonly Exposure[]
  readonly issues: readonly ActivationIssue[]
}

/** The subset of `window.localStorage` the module needs. */
export interface AssignmentStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
