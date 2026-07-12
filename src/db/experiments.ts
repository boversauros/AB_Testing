import controlHeroURL from '../../images/hero_image.jpg'
import testHeroURL from '../../images/hero_variant.jpg'
import type { ExperimentCatalog } from '@/experimentation'

const experiments: ExperimentCatalog = [
  {
    name: 'Article experiment',
    id: 'ArticleExperimentId',
    variants: [
      {
        id: 'control',
        content: {
          type: 'text',
          text: 'Meet the app that revolutionized reading.'
        }
      },
      {
        id: 'variation1',
        content: {
          type: 'text',
          text: 'Meet the app that has 18 million users.'
        }
      },
      {
        id: 'variation2',
        content: {
          type: 'text',
          text: 'Media app that helps you read more.'
        }
      }
    ],
    placement: 'article-header'
  },
  {
    name: 'Hero experiment',
    id: 'HeroExperimentId',
    variants: [
      {
        id: 'control',
        content: {
          type: 'image',
          src: controlHeroURL,
          alt: 'Check out the Blinkist app',
          width: 300
        }
      },
      {
        id: 'test',
        content: {
          type: 'image',
          src: testHeroURL,
          alt: 'Check out the Blinkist app',
          width: 300
        }
      }
    ],
    placement: 'hero'
  }
]

export default experiments
