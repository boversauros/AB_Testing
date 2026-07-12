import '@/styles.css'
import { Analytics } from '@/analytics'
import experiments from '@/db/experiments'
import { createExperimentation } from '@/experimentation'
import { addListener } from '@/lib/utils'

const activation = createExperimentation({
  root: document,
  storage: localStorage
}).activate(experiments)

const analytics = new Analytics({ context: { exposures: activation.exposures } })

for (const issue of activation.issues) console.warn(issue.message)
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
