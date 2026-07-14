import { reconcileAssignments } from './assignments'
import { createVariantElement } from './render'
import { validateCatalog } from './validate'
import type {
  ActivationIssue,
  ActivationResult,
  AssignmentStorage,
  Exposure,
  ExperimentCatalog
} from './types'

export type {
  ActivationIssue,
  ActivationResult,
  AssignmentStorage,
  Experiment,
  ExperimentCatalog,
  ExperimentVariant,
  Exposure,
  VariantContent
} from './types'

export interface ExperimentationOptions {
  /** Where placements are looked up, usually `document`. */
  readonly root: Document | Element
  /** Where visitor assignments persist, usually `window.localStorage`. */
  readonly storage: AssignmentStorage
}

export interface Experimentation {
  /**
   * Assigns one variant per experiment, persists the assignments, renders
   * the variants, and reports what happened.
   *
   * Exposures only include variants that actually reached the DOM. Rendering
   * replaces the placement's children, so repeated activation is idempotent.
   * An experiment whose placement is missing becomes an issue instead of
   * breaking the others, and its existing page content is left untouched.
   *
   * @throws Error before touching storage or the DOM when the catalog itself
   * is invalid, since that is a programming error rather than a page state.
   */
  activate(catalog: ExperimentCatalog): ActivationResult
}

const documentOf = (root: Document | Element): Document =>
  root.ownerDocument ?? (root as Document)

/** Escapes quotes and backslashes so a placement name is a safe selector. */
const escapeAttributeValue = (value: string): string =>
  value.replace(/["\\]/g, '\\$&')

const findPlacement = (
  root: Document | Element,
  placement: string
): HTMLElement | null =>
  root.querySelector<HTMLElement>(
    `[data-placement="${escapeAttributeValue(placement)}"]`
  )

export const createExperimentation = ({
  root,
  storage
}: ExperimentationOptions): Experimentation => {
  const activate = (catalog: ExperimentCatalog): ActivationResult => {
    validateCatalog(catalog)

    const assignments = reconcileAssignments(catalog, storage)
    const exposures: Exposure[] = []
    const issues: ActivationIssue[] = []

    for (const experiment of catalog) {
      const assignedVariantId = assignments[experiment.id]
      const variant = experiment.variants.find(
        candidate => candidate.id === assignedVariantId
      )

      if (!variant) {
        // Unreachable after reconciliation; reported instead of thrown so one
        // experiment can never take down the rest of the page.
        issues.push({
          experimentId: experiment.id,
          message: `No variant is assigned for experiment "${experiment.id}"`
        })
        continue
      }

      const placement = findPlacement(root, experiment.placement)
      if (!placement) {
        issues.push({
          experimentId: experiment.id,
          message: `Placement "${experiment.placement}" was not found`
        })
        continue
      }

      placement.replaceChildren(
        createVariantElement(documentOf(root), variant.content)
      )
      exposures.push({ experimentId: experiment.id, variantId: variant.id })
    }

    return Object.freeze({
      exposures: Object.freeze(exposures),
      issues: Object.freeze(issues)
    })
  }

  return { activate }
}
