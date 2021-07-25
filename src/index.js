import "./styles.css";
import { addListener } from './lib/utils';
import { Analytics } from './analytics'
import { Experiments } from './experiments'

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
