import controlHeroURL from '../../images/hero_image.jpg'
import testHeroURL from '../../images/hero_variant.jpg'
import type { ExperimentCatalog } from '@/experimentation'

/**
 * The experiment catalog a server could deliver. Placements are semantic
 * names resolved by the experimentation module, so the catalog never carries
 * DOM selectors.
 */
const experimentCatalog: ExperimentCatalog = [
  {
    id: 'article-headline',
    name: 'Article experiment',
    placement: 'article-header',
    variants: [
      {
        id: 'control',
        content: { kind: 'text', text: 'Meet the app that revolutionized reading.' }
      },
      {
        id: 'variation1',
        content: { kind: 'text', text: 'Meet the app that has 18 million users.' }
      },
      {
        id: 'variation2',
        content: { kind: 'text', text: 'Media app that helps you read more.' }
      }
    ]
  },
  {
    id: 'hero-image',
    name: 'Hero experiment',
    placement: 'hero',
    variants: [
      {
        id: 'control',
        content: {
          kind: 'image',
          src: controlHeroURL,
          alt: 'Check out the Blinkist app',
          width: 300
        }
      },
      {
        id: 'test',
        content: {
          kind: 'image',
          src: testHeroURL,
          alt: 'Check out the Blinkist app',
          width: 300
        }
      }
    ]
  }
]

export default experimentCatalog
