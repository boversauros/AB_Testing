import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Experiments } from '@/experiments'
import * as storage from '@/lib/localStorage'
import * as utils from '@/lib/utils'

const setItem = vi.spyOn(storage, 'setItem')
const getItem = vi.spyOn(storage, 'getItem')
const imageParser = vi.spyOn(utils, 'imageParser')

describe('Experiments', () => {
  beforeEach(() => {
    setItem.mockClear()
    getItem.mockClear()
    imageParser.mockClear()
  })

  it('should give variations for a user', () => {
    const experiments = new Experiments()
    const variations = experiments.getVariationsForUser()
    expect(getItem).toHaveBeenCalled()
    expect(setItem).toHaveBeenCalled()
    expect(variations).toBeDefined()
  })

  it('should render variations correctly', () => {
    document.body.innerHTML = `<div>
      <picture id="hero"></picture>
      <div id="article-header"></div>
    </div>`

    const experiments = new Experiments()
    experiments._variations = [
      { id: 'ArticleExperimentId', variation: 'variation1' },
      { id: 'HeroExperimentId', variation: 'control' }
    ]
    experiments.renderVariations()
    expect(imageParser).toHaveBeenCalled()
    const header = document.querySelector('#article-header')?.children.item(0)
    expect(header?.textContent).toBe('Meet the app that has 18 million users.')
  })
})
