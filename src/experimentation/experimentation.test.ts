import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createExperimentation,
  type ExperimentCatalog
} from '@/experimentation'

const catalog: ExperimentCatalog = [
  {
    id: 'headline',
    name: 'Headline',
    placement: 'article-header',
    variants: [
      { id: 'control', content: { type: 'text', text: 'Control headline' } },
      { id: 'social-proof', content: { type: 'text', text: '18m readers' } },
      { id: 'benefit', content: { type: 'text', text: 'Read more' } }
    ]
  },
  {
    id: 'hero-image',
    name: 'Hero image',
    placement: 'hero',
    variants: [
      {
        id: 'control',
        content: { type: 'image', src: '/control.jpg', alt: 'Control', width: 300 }
      },
      {
        id: 'test',
        content: { type: 'image', src: '/test.jpg', alt: 'Test', width: 300 }
      }
    ]
  }
]

const renderPlacements = (): void => {
  document.body.innerHTML = `
    <picture data-experiment-placement="hero"><span>Original hero</span></picture>
    <div data-experiment-placement="article-header">Original headline</div>
  `
}

const activate = (experimentCatalog: ExperimentCatalog = catalog) =>
  createExperimentation({ root: document, storage: localStorage }).activate(
    experimentCatalog
  )

describe('experimentation', () => {
  beforeEach(() => {
    localStorage.clear()
    renderPlacements()
    vi.restoreAllMocks()
  })

  it('assigns, persists, renders, and returns immutable exposure context', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const result = activate()

    expect(result.exposures).toEqual([
      {
        experimentId: 'headline',
        variantId: 'control',
        placement: 'article-header'
      },
      { experimentId: 'hero-image', variantId: 'control', placement: 'hero' }
    ])
    expect(result.issues).toEqual([])
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.exposures)).toBe(true)
    expect(localStorage.length).toBe(1)
    expect(document.querySelector('[data-experiment-placement="hero"] img')).not.toBeNull()
    expect(
      document.querySelector('[data-experiment-placement="article-header"]')
        ?.textContent
    ).toBe('Control headline')
  })

  it('reuses valid assignments after recreating the module', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const first = activate()

    Math.random = vi.fn(() => 0.99)
    renderPlacements()
    const second = activate()

    expect(second.exposures).toEqual(first.exposures)
    expect(Math.random).not.toHaveBeenCalled()
  })

  it('selects all three variants at equal-width random intervals', () => {
    const headlineOnly = [catalog[0]] as ExperimentCatalog
    const random = vi.spyOn(Math, 'random')
    const selections = [0, 1 / 3, 2 / 3].map(value => {
      localStorage.clear()
      random.mockReturnValue(value)
      return activate(headlineOnly).exposures[0]?.variantId
    })

    expect(selections).toEqual(['control', 'social-proof', 'benefit'])
  })

  it('repairs corrupt storage and stale variant assignments', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    activate()
    const storageKey = localStorage.key(0)
    expect(storageKey).not.toBeNull()

    localStorage.setItem(storageKey ?? '', '{broken')
    renderPlacements()
    const corruptResult = activate()
    expect(corruptResult.issues.map(current => current.code)).toContain(
      'storage-repaired'
    )

    localStorage.setItem(
      storageKey ?? '',
      JSON.stringify({
        version: 1,
        assignments: { headline: 'removed', 'hero-image': 'control' }
      })
    )
    renderPlacements()
    const staleResult = activate()
    expect(staleResult.issues.map(current => current.code)).toContain(
      'storage-repaired'
    )
    expect(staleResult.exposures[0]?.variantId).toBe('control')
  })

  it('is idempotent when activation is repeated', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const experimentation = createExperimentation({
      root: document,
      storage: localStorage
    })

    experimentation.activate(catalog)
    const second = experimentation.activate(catalog)

    expect(
      document.querySelector('[data-experiment-placement="hero"]')?.children
    ).toHaveLength(1)
    expect(
      document.querySelector('[data-experiment-placement="article-header"]')
        ?.children
    ).toHaveLength(1)
    expect(second.exposures).toHaveLength(2)
  })

  it('keeps rendering unrelated experiments when a placement is missing', () => {
    document.querySelector('[data-experiment-placement="hero"]')?.remove()
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const result = activate()

    expect(result.exposures).toHaveLength(1)
    expect(result.exposures[0]?.experimentId).toBe('headline')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'missing-placement',
        experimentId: 'hero-image'
      })
    ])
  })

  it('detects an invalid catalog before changing control content', () => {
    const invalidCatalog: ExperimentCatalog = [
      {
        id: 'invalid',
        name: 'Invalid',
        placement: 'article-header',
        variants: []
      }
    ]

    const result = activate(invalidCatalog)

    expect(result.exposures).toEqual([])
    expect(result.issues[0]?.code).toBe('invalid-catalog')
    expect(
      document.querySelector('[data-experiment-placement="article-header"]')
        ?.textContent
    ).toBe('Original headline')
    expect(localStorage.length).toBe(0)
  })

  it('renders text literally without interpreting HTML', () => {
    const textCatalog: ExperimentCatalog = [
      {
        id: 'safe-text',
        name: 'Safe text',
        placement: 'article-header',
        variants: [
          {
            id: 'only',
            content: { type: 'text', text: '<strong>Literal text</strong>' }
          }
        ]
      }
    ]

    activate(textCatalog)
    const target = document.querySelector(
      '[data-experiment-placement="article-header"]'
    )

    expect(target?.querySelector('strong')).toBeNull()
    expect(target?.textContent).toBe('<strong>Literal text</strong>')
  })
})
