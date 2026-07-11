import controlHeroURL from '../../images/hero_image.jpg'
import testHeroURL from '../../images/hero_variant.jpg'
import experiments from '../db/experiments'
import * as storage from '../lib/localStorage'
import { imageParser } from '../lib/utils'

export interface ExperimentAssignment {
  id: string
  variation: string
}

const LOCAL_STORAGE_VARIATIONS_KEY = 'variations'

const HERO_IMAGES: Readonly<Record<string, string>> = {
  control: controlHeroURL,
  test: testHeroURL
}

const isAssignment = (value: unknown): value is ExperimentAssignment => {
  if (typeof value !== 'object' || value === null) return false

  return (
    'id' in value &&
    typeof value.id === 'string' &&
    'variation' in value &&
    typeof value.variation === 'string'
  )
}

const parseAssignments = (value: string | null): ExperimentAssignment[] | null => {
  if (value === null) return null

  const parsed: unknown = JSON.parse(value)
  return Array.isArray(parsed) && parsed.every(isAssignment) ? parsed : null
}

export class Experiments {
  _variations: ExperimentAssignment[] = []

  getVariationsForUser(): ExperimentAssignment[] {
    let variations = parseAssignments(
      storage.getItem(LOCAL_STORAGE_VARIATIONS_KEY)
    )

    if (!variations) {
      variations = experiments.map(({ id, variants }) => {
        const selectedIndex = Math.round(Math.random() * (variants.length - 1))
        const selectedVariant = variants[selectedIndex]

        if (!selectedVariant) {
          throw new Error(`Experiment ${id} has no selectable variants`)
        }

        return { id, variation: selectedVariant.id }
      })

      storage.setItem(
        LOCAL_STORAGE_VARIATIONS_KEY,
        JSON.stringify(variations)
      )
    }

    this._variations = variations
    return variations
  }

  renderVariations(): void {
    experiments.forEach(({ id, container, variants }) => {
      const assignment = this._variations.find(
        variation => variation.id === id
      )
      const selected = variants.find(
        variant => variant.id === assignment?.variation
      )
      const target = document.querySelector<HTMLElement>(container)

      if (!selected || !target) {
        throw new Error(`Unable to render experiment ${id}`)
      }

      if (selected.content.includes('img') && selected.isInternal === true) {
        const imageURL = HERO_IMAGES[selected.id]
        if (!imageURL) {
          throw new Error(`No internal image configured for ${selected.id}`)
        }
        target.appendChild(imageParser(selected.content, imageURL))
      } else {
        target.innerHTML = selected.content
      }
    })
  }
}
