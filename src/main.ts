import './styles.css'
import { Analytics } from './analytics'
import { Experiments } from './experiments'
import { addListener } from './lib/utils'

const experiments = new Experiments()
const variations = experiments.getVariationsForUser()
experiments.renderVariations()

const analytics = new Analytics({ context: { variations } })
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

addListener(signUp, 'click', trackSignUp)

analytics.page('Home Viewed', {
  url: window.location.href
})
