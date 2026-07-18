import { afterEach, describe, expect, it, vi } from 'vitest'
import { createExperimentation } from '@/experimentation'
import type { AssignmentStorage, ExperimentCatalog } from '@/experimentation'

const STORAGE_KEY = 'ab-testing:assignments:v1'

const createMemoryStorage = (
  initial: Record<string, string> = {}
): AssignmentStorage => {
  const entries = new Map(Object.entries(initial))
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value)
    }
  }
}

const catalog: ExperimentCatalog = [
  {
    id: 'headline',
    name: 'Headline experiment',
    placement: 'article-header',
    variants: [
      { id: 'control', content: { kind: 'text', text: 'Control headline' } },
      { id: 'variation1', content: { kind: 'text', text: 'First variation' } },
      { id: 'variation2', content: { kind: 'text', text: 'Second variation' } }
    ]
  },
  {
    id: 'hero',
    name: 'Hero experiment',
    placement: 'hero',
    variants: [
      {
        id: 'control',
        content: { kind: 'image', src: 'control.jpg', alt: 'Hero', width: 300 }
      },
      {
        id: 'test',
        content: { kind: 'image', src: 'test.jpg', alt: 'Hero', width: 300 }
      }
    ]
  }
]

const createPage = (): Document => {
  document.body.innerHTML = `
    <picture data-placement="hero"></picture>
    <div data-placement="article-header"></div>
  `
  return document
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('createExperimentation', () => {
  it('assigns, persists, renders, and reports exposures in one activation', () => {
    const storage = createMemoryStorage()
    const experimentation = createExperimentation({
      root: createPage(),
      storage
    })

    const activation = experimentation.activate(catalog)

    expect(activation.exposures).toHaveLength(2)
    expect(activation.issues).toHaveLength(0)

    const persisted: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null')
    expect(persisted).toEqual({
      headline: activation.exposures[0]?.variantId,
      hero: activation.exposures[1]?.variantId
    })

    const headline = document.querySelector('[data-placement="article-header"]')
    const hero = document.querySelector('[data-placement="hero"]')
    expect(headline?.textContent).not.toBe('')
    expect(hero?.querySelector('img')).toBeInstanceOf(HTMLImageElement)
  })

  it('gives the visitor one valid variant per experiment', () => {
    const experimentation = createExperimentation({
      root: createPage(),
      storage: createMemoryStorage()
    })

    const activation = experimentation.activate(catalog)

    for (const experiment of catalog) {
      const exposures = activation.exposures.filter(
        exposure => exposure.experimentId === experiment.id
      )
      expect(exposures).toHaveLength(1)
      expect(experiment.variants.map(variant => variant.id)).toContain(
        exposures[0]?.variantId
      )
    }
  })

  it('keeps assignments stable when the module is recreated with the same storage', () => {
    const storage = createMemoryStorage()

    const firstActivation = createExperimentation({
      root: createPage(),
      storage
    }).activate(catalog)
    const secondActivation = createExperimentation({
      root: createPage(),
      storage
    }).activate(catalog)

    expect(secondActivation.exposures).toEqual(firstActivation.exposures)
  })

  it('selects variants uniformly without index bias', () => {
    // With three variants, biased Math.round(random * 2) maps 0.3 to the
    // middle variant, while unbiased Math.floor(random * 3) maps it to the
    // first one.
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const lowActivation = createExperimentation({
      root: createPage(),
      storage: createMemoryStorage()
    }).activate(catalog)
    expect(lowActivation.exposures[0]?.variantId).toBe('control')

    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const highActivation = createExperimentation({
      root: createPage(),
      storage: createMemoryStorage()
    }).activate(catalog)
    expect(highActivation.exposures[0]?.variantId).toBe('variation2')
  })

  it('repairs corrupt storage and persists valid assignments', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: 'not-json{{' })
    const experimentation = createExperimentation({
      root: createPage(),
      storage
    })

    const activation = experimentation.activate(catalog)

    expect(activation.exposures).toHaveLength(2)
    const persisted: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null')
    expect(persisted).toEqual(
      Object.fromEntries(
        activation.exposures.map(({ experimentId, variantId }) => [
          experimentId,
          variantId
        ])
      )
    )
  })

  it('replaces assignments that reference removed variants', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({ headline: 'removed-variant', hero: 'test' })
    })

    const activation = createExperimentation({
      root: createPage(),
      storage
    }).activate(catalog)

    const headlineExposure = activation.exposures.find(
      exposure => exposure.experimentId === 'headline'
    )
    expect(['control', 'variation1', 'variation2']).toContain(
      headlineExposure?.variantId
    )

    const heroExposure = activation.exposures.find(
      exposure => exposure.experimentId === 'hero'
    )
    expect(heroExposure?.variantId).toBe('test')
  })

  it('creates no duplicate DOM when activation runs twice', () => {
    const experimentation = createExperimentation({
      root: createPage(),
      storage: createMemoryStorage()
    })

    experimentation.activate(catalog)
    experimentation.activate(catalog)

    expect(
      document.querySelector('[data-placement="article-header"]')?.childElementCount
    ).toBe(1)
    expect(
      document.querySelector('[data-placement="hero"]')?.childElementCount
    ).toBe(1)
  })

  it('reports a missing placement as an issue without breaking other experiments', () => {
    document.body.innerHTML = '<div data-placement="article-header"></div>'

    const activation = createExperimentation({
      root: document,
      storage: createMemoryStorage()
    }).activate(catalog)

    expect(activation.exposures.map(exposure => exposure.experimentId)).toEqual([
      'headline'
    ])
    expect(activation.issues).toEqual([
      { experimentId: 'hero', message: 'Placement "hero" was not found' }
    ])
  })

  it('rejects an invalid catalog before touching the DOM', () => {
    createPage()
    const invalidCatalog: ExperimentCatalog = [
      { id: 'empty', name: 'No variants', placement: 'article-header', variants: [] }
    ]

    const experimentation = createExperimentation({
      root: document,
      storage: createMemoryStorage()
    })

    expect(() => experimentation.activate(invalidCatalog)).toThrowError(
      'Invalid experiment catalog: Experiment "empty" has no variants'
    )
    expect(
      document.querySelector('[data-placement="article-header"]')?.childElementCount
    ).toBe(0)
  })

  it('renders text as plain text so markup cannot be injected', () => {
    const markupCatalog: ExperimentCatalog = [
      {
        id: 'headline',
        name: 'Headline experiment',
        placement: 'article-header',
        variants: [
          {
            id: 'control',
            content: { kind: 'text', text: '<img src=x onerror=alert(1)>' }
          }
        ]
      }
    ]

    createExperimentation({
      root: createPage(),
      storage: createMemoryStorage()
    }).activate(markupCatalog)

    const placement = document.querySelector('[data-placement="article-header"]')
    expect(placement?.querySelector('img')).toBeNull()
    expect(placement?.textContent).toBe('<img src=x onerror=alert(1)>')
  })

  it('returns immutable exposures and issues', () => {
    const activation = createExperimentation({
      root: createPage(),
      storage: createMemoryStorage()
    }).activate(catalog)

    expect(Object.isFrozen(activation)).toBe(true)
    expect(Object.isFrozen(activation.exposures)).toBe(true)
    expect(Object.isFrozen(activation.issues)).toBe(true)
  })
})
