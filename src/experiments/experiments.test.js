import { Experiments } from './index.js'
import * as storage from '../lib/localStorage.js'
import * as utils from '../lib/utils.js'

const setItem = jest.spyOn(storage, 'setItem')
const getItem = jest.spyOn(storage, 'getItem')
const imageParser = jest.spyOn(utils, 'imageParser')

describe('Experiments', () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        setItem.mockClear()
        getItem.mockClear()
        imageParser.mockClear();
    })

    it('should give variations for a user', () => {
        const experiments = new Experiments()
        const variations = experiments.getVariationsForUser()
        expect(getItem).toHaveBeenCalled()
        expect(setItem).toHaveBeenCalled()
        expect(variations).toBeDefined()
    })

    it('should render variations correctly', () => {
        document.body.innerHTML =
            `<div>
          <picture id="hero" />
          <div id="article-header" />
        </div>`

        const experiments = new Experiments()
        experiments._variations = [
            { id: 'ArticleExperimentId', variation: 'test' },
            { id: 'HeroExperimentId', variation: 'control' }
        ]
        experiments.renderVariations()
        expect(imageParser).toHaveBeenCalled()
        const header = document.querySelector('#article-header').children[0]
        expect(header.textContent).toBe('Meet the app that has 18 million users.')
    })

})