import posthog from 'posthog-js';

if (import.meta.env.PROD) {
  posthog.init('phc_G783rtb7P2zMex7Mljk5nESMUDYwcGWGg3t0m6dNNKf', {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'never',
  });
}
