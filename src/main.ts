import '@/styles.css'
import { Analytics } from '@/analytics'
import experimentCatalog from '@/db/experiments'
import { createExperimentation } from '@/experimentation'

const experimentation = createExperimentation({
  root: document,
  storage: window.localStorage
})
const activation = experimentation.activate(experimentCatalog)

const analytics = new Analytics({
  context: { variations: activation.exposures }
})
const signUp = document.querySelector<HTMLAnchorElement>('a')

if (!signUp) {
  throw new Error('Sign-up link was not found')
}

const trackSignUp = (event: Event): void => {
  event.preventDefault()
  analytics.track(
    'Sign Up',
    {
      url: window.location.href
    },
    true
  )

  console.log('PAYLOAD_')
}

signUp.addEventListener('click', trackSignUp)

analytics.page('Home Viewed', {
  url: window.location.href
})
