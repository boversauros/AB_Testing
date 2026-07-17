import type { AssignmentStorage, Experiment, ExperimentCatalog } from './types'

/** Maps an experiment id to the variant id assigned to this visitor. */
export type AssignmentMap = Readonly<Record<string, string>>

/**
 * Namespaced and versioned so unrelated storage keys are never touched and
 * future schema changes can start fresh instead of guessing at old data.
 */
const STORAGE_KEY = 'ab-testing:assignments:v1'

const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  return Object.values(value).every(entry => typeof entry === 'string')
}

/** Corrupt or unreadable storage degrades to "no assignments yet". */
const readStoredAssignments = (
  storage: AssignmentStorage
): Record<string, string> => {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return {}

  try {
    const parsed: unknown = JSON.parse(raw)
    return isStringRecord(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/** Uniform selection: every variant has the same probability of being picked. */
const pickRandomVariantId = (experiment: Experiment): string => {
  const index = Math.floor(Math.random() * experiment.variants.length)
  const variant = experiment.variants[index]

  if (!variant) {
    throw new Error(`Experiment "${experiment.id}" has no selectable variants`)
  }
  return variant.id
}

/**
 * Produces one valid variant assignment per catalog experiment.
 *
 * Stored assignments are reused when they still point to an existing variant;
 * anything corrupt, stale, or missing is repaired with a fresh random pick.
 * The repaired map is persisted so the visitor sees the same variants on the
 * next reload.
 */
export const reconcileAssignments = (
  catalog: ExperimentCatalog,
  storage: AssignmentStorage
): AssignmentMap => {
  const stored = readStoredAssignments(storage)
  const assignments: Record<string, string> = {}

  for (const experiment of catalog) {
    const storedVariantId = stored[experiment.id]
    const isStillValid =
      storedVariantId !== undefined &&
      experiment.variants.some(variant => variant.id === storedVariantId)

    assignments[experiment.id] = isStillValid
      ? storedVariantId
      : pickRandomVariantId(experiment)
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(assignments))
  return assignments
}
