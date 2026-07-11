export interface ExperimentVariant {
  readonly id: string
  readonly content: string
  readonly isInternal?: boolean
}

export interface ExperimentDefinition {
  readonly name: string
  readonly id: string
  readonly variants: readonly ExperimentVariant[]
  readonly container: string
}

const experiments: readonly ExperimentDefinition[] = [
  {
    name: 'Article experiment',
    id: 'ArticleExperimentId',
    variants: [
      {
        id: 'control',
        content: '<div>Meet the app that revolutionized reading.</div>'
      },
      {
        id: 'variation1',
        content: '<div>Meet the app that has 18 million users.</div>'
      },
      {
        id: 'variation2',
        content: '<div>Media app that helps you read more.</div>'
      }
    ],
    container: '#article-header'
  },
  {
    name: 'Hero experiment',
    id: 'HeroExperimentId',
    variants: [
      {
        id: 'control',
        content:
          '<img width="300" src="images/hero_image.jpg" alt="Check out the Blinkist app" />',
        isInternal: true
      },
      {
        id: 'test',
        content:
          '<img width="300" src="images/hero_variant.jpg" alt="Check out the Blinkist app" />',
        isInternal: true
      }
    ],
    container: '#hero'
  }
]

export default experiments
