import experiments from '../db/experiments.json'
import * as storage from '../lib/localStorage.js'
import { imageParser } from '../lib/utils'
import imageURL from '../../images/hero_image.jpg'

/**
 * Experiments class.
 * @module Experiments
 */


/** @const {String} LocalStorage key for the variations */
const LOCAL_STORAGE_VARIATIONS_KEY = 'variations'

/** @const {Array} Array of experiment variations */
// const VARIATIONS_KEYS = ["control", "variant1", "variant2"]

/** This class is an essential library to generate random a/b testing cases and render variations. */
export class Experiments {
  _variations


  /**
   * method to set variations for a user
   * @return {Array}  An array of variations set for each experiment
   */
  getVariationsForUser() {
    let variations = JSON.parse(storage.getItem(LOCAL_STORAGE_VARIATIONS_KEY))

    if (!variations) {
      variations = experiments.map(({ id, variants }) => {
        const selectedVariation = Math.round(Math.random() * (variants.length - 1))
        return { id, variation: variants[selectedVariation].id }
      })

      storage.setItem(LOCAL_STORAGE_VARIATIONS_KEY, JSON.stringify(variations))
    }

    this._variations = variations
    return variations
  }

  /**
   * method to render all the variations for each experiment
   * @return {Void} 
   */
  renderVariations() {
    const variations = this._variations
    experiments.forEach(({ id, container, variants }) => {
      const [{ variation }] = variations.filter(variation => variation.id === id)
      const [selected] = variants?.filter(variant => variant.id === variation)
      if (selected.content?.includes('img') && selected.isInternal) {
        const image = imageParser(selected.content, imageURL)
        document.querySelector(container).appendChild(image)
      } else {
        document.querySelector(container).innerHTML = selected.content
      }
    })
  }
}