// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
    integrations: [
        // @ts-ignore
        // https://github.com/getsentry/sentry-javascript/issues/4569
        new Sentry.BrowserTracing({
            tracingOrigins: [process.env.NEXT_PUBLIC_SENTRY_ORIGINS]
        })
    ],
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
});
