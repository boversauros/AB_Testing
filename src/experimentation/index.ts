export type ExperimentPlacement = 'article-header' | 'hero'

export type VariantContent =
  | {
      readonly type: 'text'
      readonly text: string
    }
  | {
      readonly type: 'image'
      readonly src: string
      readonly alt: string
      readonly width?: number
    }

export interface ExperimentVariant {
  readonly id: string
  readonly content: VariantContent
}

export interface ExperimentDefinition {
  readonly id: string
  readonly name: string
  readonly placement: ExperimentPlacement
  readonly variants: readonly ExperimentVariant[]
}

export type ExperimentCatalog = readonly ExperimentDefinition[]

export interface ExperimentExposure {
  readonly experimentId: string
  readonly variantId: string
  readonly placement: ExperimentPlacement
}

export type ExperimentationIssueCode =
  | 'invalid-catalog'
  | 'missing-placement'
  | 'render-failed'
  | 'storage-unavailable'
  | 'storage-repaired'

export interface ExperimentationIssue {
  readonly code: ExperimentationIssueCode
  readonly message: string
  readonly experimentId?: string
}

export interface ActivationResult {
  readonly exposures: readonly ExperimentExposure[]
  readonly issues: readonly ExperimentationIssue[]
}

export interface Experimentation {
  activate(catalog: ExperimentCatalog): ActivationResult
}

interface PersistedAssignments {
  readonly version: 1
  readonly assignments: Readonly<Record<string, string>>
}

interface AssignmentResolution {
  readonly assignments: ReadonlyMap<string, string>
  readonly issues: ExperimentationIssue[]
}

const STORAGE_KEY = 'ab-testing:experimentation:assignments:v1'
const STORAGE_VERSION = 1

const PLACEMENT_SELECTORS: Readonly<Record<ExperimentPlacement, string>> = {
  'article-header': '[data-experiment-placement="article-header"]',
  hero: '[data-experiment-placement="hero"]'
}

const issue = (
  code: ExperimentationIssueCode,
  message: string,
  experimentId?: string
): ExperimentationIssue =>
  Object.freeze(
    experimentId === undefined ? { code, message } : { code, message, experimentId }
  )

const immutableResult = (
  exposures: ExperimentExposure[],
  issues: ExperimentationIssue[]
): ActivationResult =>
  Object.freeze({
    exposures: Object.freeze(exposures.map(exposure => Object.freeze(exposure))),
    issues: Object.freeze(issues.map(currentIssue => Object.freeze(currentIssue)))
  })

const validateCatalog = (catalog: ExperimentCatalog): ExperimentationIssue[] => {
  const issues: ExperimentationIssue[] = []
  const experimentIds = new Set<string>()

  for (const experiment of catalog) {
    if (experiment.id.trim() === '') {
      issues.push(issue('invalid-catalog', 'Experiment ids cannot be empty.'))
    } else if (experimentIds.has(experiment.id)) {
      issues.push(
        issue(
          'invalid-catalog',
          `Experiment id "${experiment.id}" is duplicated.`,
          experiment.id
        )
      )
    }
    experimentIds.add(experiment.id)

    if (!(experiment.placement in PLACEMENT_SELECTORS)) {
      issues.push(
        issue(
          'invalid-catalog',
          `Experiment "${experiment.id}" has an unknown placement.`,
          experiment.id
        )
      )
    }

    if (experiment.variants.length === 0) {
      issues.push(
        issue(
          'invalid-catalog',
          `Experiment "${experiment.id}" must contain at least one variant.`,
          experiment.id
        )
      )
      continue
    }

    const variantIds = new Set<string>()
    for (const variant of experiment.variants) {
      if (variant.id.trim() === '' || variantIds.has(variant.id)) {
        issues.push(
          issue(
            'invalid-catalog',
            `Experiment "${experiment.id}" contains an empty or duplicate variant id.`,
            experiment.id
          )
        )
      }
      variantIds.add(variant.id)

      if (
        (variant.content.type === 'text' && variant.content.text === '') ||
        (variant.content.type === 'image' &&
          (variant.content.src === '' || variant.content.alt === ''))
      ) {
        issues.push(
          issue(
            'invalid-catalog',
            `Experiment "${experiment.id}" contains incomplete variant content.`,
            experiment.id
          )
        )
      }
    }
  }

  return issues
}

const readPersistedAssignments = (value: string | null): PersistedAssignments | null => {
  if (value === null) return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) return null
    if (!('version' in parsed) || parsed.version !== STORAGE_VERSION) return null
    if (!('assignments' in parsed) || typeof parsed.assignments !== 'object') {
      return null
    }
    if (parsed.assignments === null || Array.isArray(parsed.assignments)) return null

    const values = Object.values(parsed.assignments)
    return values.every(assignment => typeof assignment === 'string')
      ? (parsed as unknown as PersistedAssignments)
      : null
  } catch {
    return null
  }
}

const selectVariant = (variants: readonly ExperimentVariant[]): ExperimentVariant => {
  const index = Math.floor(Math.random() * variants.length)
  const selected = variants[index]
  if (selected === undefined) {
    throw new Error('Unable to select a variant.')
  }
  return selected
}

const resolveAssignments = (
  catalog: ExperimentCatalog,
  storage: Storage
): AssignmentResolution => {
  const issues: ExperimentationIssue[] = []
  let rawAssignments: string | null = null
  let storageReadable = true

  try {
    rawAssignments = storage.getItem(STORAGE_KEY)
  } catch {
    storageReadable = false
    issues.push(
      issue('storage-unavailable', 'Assignments could not be read from storage.')
    )
  }

  const persisted = readPersistedAssignments(rawAssignments)
  const assignments = new Map<string, string>()
  let repaired = storageReadable && rawAssignments !== null && persisted === null

  for (const experiment of catalog) {
    const storedVariantId = persisted?.assignments[experiment.id]
    const storedVariant = experiment.variants.find(
      variant => variant.id === storedVariantId
    )
    const selectedVariant = storedVariant ?? selectVariant(experiment.variants)
    assignments.set(experiment.id, selectedVariant.id)

    if (storedVariantId !== undefined && storedVariant === undefined) repaired = true
  }

  if (
    persisted !== null &&
    Object.keys(persisted.assignments).some(
      experimentId => !assignments.has(experimentId)
    )
  ) {
    repaired = true
  }

  const shouldPersist = persisted === null || repaired ||
    Object.keys(persisted.assignments).length !== assignments.size

  if (shouldPersist) {
    try {
      const value: PersistedAssignments = {
        version: STORAGE_VERSION,
        assignments: Object.fromEntries(assignments)
      }
      storage.setItem(STORAGE_KEY, JSON.stringify(value))
      if (repaired) {
        issues.push(
          issue('storage-repaired', 'Invalid or stale assignments were repaired.')
        )
      }
    } catch {
      issues.push(
        issue('storage-unavailable', 'Assignments could not be persisted to storage.')
      )
    }
  }

  return { assignments, issues }
}

const createVariantNode = (
  document: Document,
  content: VariantContent
): HTMLElement => {
  switch (content.type) {
    case 'text': {
      const element = document.createElement('div')
      element.textContent = content.text
      return element
    }
    case 'image': {
      const element = document.createElement('img')
      element.src = content.src
      element.alt = content.alt
      if (content.width !== undefined) element.width = content.width
      return element
    }
  }
}

export const createExperimentation = ({
  root,
  storage
}: {
  readonly root: Document
  readonly storage: Storage
}): Experimentation => ({
  activate(catalog): ActivationResult {
    const catalogIssues = validateCatalog(catalog)
    if (catalogIssues.length > 0) return immutableResult([], catalogIssues)

    const resolution = resolveAssignments(catalog, storage)
    const exposures: ExperimentExposure[] = []
    const issues = [...resolution.issues]

    for (const experiment of catalog) {
      const selector = PLACEMENT_SELECTORS[experiment.placement]
      const target = root.querySelector<HTMLElement>(selector)
      if (target === null) {
        issues.push(
          issue(
            'missing-placement',
            `Placement "${experiment.placement}" was not found.`,
            experiment.id
          )
        )
        continue
      }

      const variantId = resolution.assignments.get(experiment.id)
      const variant = experiment.variants.find(current => current.id === variantId)
      if (variant === undefined) continue

      try {
        const node = createVariantNode(root, variant.content)
        target.replaceChildren(node)
        target.dataset.experimentId = experiment.id
        target.dataset.experimentVariant = variant.id
        exposures.push({
          experimentId: experiment.id,
          variantId: variant.id,
          placement: experiment.placement
        })
      } catch {
        issues.push(
          issue(
            'render-failed',
            `Experiment "${experiment.id}" could not be rendered.`,
            experiment.id
          )
        )
      }
    }

    return immutableResult(exposures, issues)
  }
})
