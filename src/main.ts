import '@/styles.css'
import { createAnalytics, createConsoleSink } from '@/analytics'
import experimentCatalog from '@/db/experiments'
import { createExperimentation } from '@/experimentation'

const experimentation = createExperimentation({
  root: document,
  storage: window.localStorage
})
const activation = experimentation.activate(experimentCatalog)

const analytics = createAnalytics({
  // Consent is application knowledge; this demo page grants it up front.
  context: () => ({
    consent: true,
    exposures: activation.exposures,
    screen: { width: window.innerWidth, height: window.innerHeight },
    userAgent: navigator.userAgent
  }),
  storage: window.localStorage,
  sink: createConsoleSink()
})

const signUp = document.querySelector<HTMLAnchorElement>('a')

if (!signUp) {
  throw new Error('Sign-up link was not found')
}

signUp.addEventListener('click', event => {
  event.preventDefault()
  analytics.record({
    kind: 'interaction',
    name: 'Sign Up',
    properties: { url: window.location.href },
    once: true
  })
})

analytics.record({
  kind: 'page',
  name: 'Home Viewed',
  properties: { url: window.location.href }
})
