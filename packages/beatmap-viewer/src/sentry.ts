import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://393a6e668a783251d5de06d72596c077@o4506916793745408.ingest.us.sentry.io/4508596824965120',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.replayCanvasIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
});
