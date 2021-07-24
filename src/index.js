import "./styles.css";
import { addListener } from './lib/utils';
import { Analytics } from './analytics'
import { Experiments } from './experiments'

// 1. A visitor sees only one variation (assigned randomly) when lands on the page.
// 2. The assigned variation doesn’t change after page reload.
// 3. Track a pageview when a visitor lands on the page.
// 4. Track an event when a visitor clicks on the “Sign up” button. Printing payload to the console would do.
// 5. We’ll determine a winning variation by comparing CTR (click-through rate) of the “Sign up” button (we’ll calculate CTR from our web analytics data). Make sure we don’t count the same visitors and clicks twice.
// 6. Allow editors to run multiple AB-tests on the same article. For example, one AB-test will test a hero image and another AB-test will test the outro copy.

// First, deal with GDPR consents
// await gdprConsent();

// Initialize experiments and get variation for user
const experiments = new Experiments()
const variations = experiments.getVariationsForUser();
experiments.renderVariations()

// Initialize analytics with context info
const analytics = new Analytics({ context: {variations} })

// Add event listener to sign up link
const [signUp]  = document.getElementsByTagName('a')

const trackSignUp = (event) => {
  event.preventDefault();
  analytics.track('Sign Up', {
    url: window.location.href
  }, true);

  console.log('PAYLOAD_')
};

addListener(signUp, 'click', trackSignUp);

analytics.page('Home Viewed', {
  url: window.location.href
});
