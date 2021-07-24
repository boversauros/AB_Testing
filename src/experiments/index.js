import experiments from '../db/experiments.json'
import * as storage from '../lib/localStorage.js'
import { imageParser } from '../lib/utils'

const LOCAL_STORAGE_VARIATIONS_KEY = 'variations'
const VARIATIONS_KEYS = ["control", "test"]

export class Experiments {
  _variations

  getVariationsForUser() {
    let variations = JSON.parse(storage.getItem(LOCAL_STORAGE_VARIATIONS_KEY))

    if (!variations) {
        variations = experiments.map(({ id, variants }) => {
        const selectedVariation = Math.round(Math.random() * (variants.length - 1))
        return { id, variation: VARIATIONS_KEYS[selectedVariation] }
      })

      storage.setItem(LOCAL_STORAGE_VARIATIONS_KEY, JSON.stringify(variations))
    }

    this._variations = variations
    return variations  
  }
 
  renderVariations() {
    const variations = this._variations
    experiments.forEach(({ id, container, variants }) => {
      const [{ variation }] = variations.filter(variation => variation.id === id)
      const [selected] = variants.filter(variant => variant.id === variation)

      if (selected.content?.includes('img') && selected.isInternal) {
        const image = imageParser(selected.content)
        document.querySelector(container).appendChild(image)
      } else {
        document.querySelector(container).innerHTML = selected.content
      }
    })
  }
}