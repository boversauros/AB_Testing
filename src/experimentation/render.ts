import type { VariantContent } from './types'

/**
 * Builds the DOM element for a variant using typed construction only.
 * Text goes through `textContent`, so catalog data can never inject markup.
 */
export const createVariantElement = (
  document: Document,
  content: VariantContent
): HTMLElement => {
  switch (content.kind) {
    case 'text': {
      const paragraph = document.createElement('p')
      paragraph.textContent = content.text
      return paragraph
    }
    case 'image': {
      const image = document.createElement('img')
      image.src = content.src
      image.alt = content.alt
      if (content.width !== undefined) {
        image.width = content.width
      }
      return image
    }
  }
}
