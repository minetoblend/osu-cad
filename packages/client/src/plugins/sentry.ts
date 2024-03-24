import * as Sentry from '@sentry/vue';
import { Router } from 'vue-router';
import { App, FunctionPlugin } from 'vue';
import { isProd, isSSR } from '@/env.ts';

const sentryEnabled = isProd && !isSSR;

export const sentry: FunctionPlugin<{ router: Router }> = (
  app: App,
  { router },
) => {
  if (sentryEnabled) {
    Sentry.init({
      app,
      dsn: 'https://8befc14b4ad6a6555c141b196b35bd96@o4506916793745408.ingest.us.sentry.io/4506916795973632',
      integrations: [
        Sentry.browserTracingIntegration({
          router,
        }),
        Sentry.feedbackIntegration({
          colorScheme: 'dark',
          showName: false,
          showEmail: false,
          autoInject: false,
          showBranding: false,
          themeDark: {
            background: '#282832',
            submitBackground: '#3DC699',
            submitBackgroundHover: '#4BEEB7',
            submitBorder: '#288C6C',
          },
        }),
      ],
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/(?:dev.)?osucad\.com\/api/,
      ],
    });
  }
};

export function useSentry<T>(fn: (sentry: typeof Sentry) => T) {
  if (sentryEnabled) {
    return fn(Sentry);
  }
}
