import type { ExperimentCatalog } from './types'

/**
 * Rejects a malformed catalog before any assignment or DOM work happens.
 * All problems are collected first so one error message reports everything.
 */
export const validateCatalog = (catalog: ExperimentCatalog): void => {
  const problems: string[] = []
  const experimentIds = new Set<string>()

  for (const experiment of catalog) {
    if (experiment.id === '') {
      problems.push('An experiment is missing an id')
    }
    if (experimentIds.has(experiment.id)) {
      problems.push(`Duplicate experiment id "${experiment.id}"`)
    }
    experimentIds.add(experiment.id)

    if (experiment.placement === '') {
      problems.push(`Experiment "${experiment.id}" is missing a placement`)
    }
    if (experiment.variants.length === 0) {
      problems.push(`Experiment "${experiment.id}" has no variants`)
    }

    const variantIds = new Set<string>()
    for (const variant of experiment.variants) {
      if (variant.id === '') {
        problems.push(`Experiment "${experiment.id}" has a variant without an id`)
      }
      if (variantIds.has(variant.id)) {
        problems.push(
          `Experiment "${experiment.id}" has a duplicate variant id "${variant.id}"`
        )
      }
      variantIds.add(variant.id)
    }
  }

  if (problems.length > 0) {
    throw new Error(`Invalid experiment catalog: ${problems.join('; ')}`)
  }
}
