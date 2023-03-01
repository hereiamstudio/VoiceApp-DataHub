/**
 * @type {import('next').NextConfig}
 */
const {withSentryConfig} = require('@sentry/nextjs');

// https://nextjs.org/docs/advanced-features/security-headers
const securityHeaders = [
    {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
    {key: 'X-Content-Type-Options', value: 'nosniff'},
    {key: 'X-Frame-Options', value: 'DENY'},
    {key: 'X-XSS-Protection', value: '1; mode=block'},
    {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; img-src 'self' data: https://www.google-analytics.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.firebase.com https://www.gstatic.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://rsms.me; font-src 'self' data: https://rsms.me; connect-src 'self' https://*.cloudfunctions.net https://*.sentry.io https://www.google-analytics.com https://www.googleapis.com"
    }
];

const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders
            }
        ];
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/projects',
                permanent: true
            }
        ];
    },
    async rewrites() {
        return [
            {
                source: '/docs/:path*',
                destination: '/:path*' // The :path parameter is used here so will not be automatically passed in the query
            }
        ];
    },
    poweredByHeader: false,
    reactStrictMode: false,
    // Matches 'eur3 (europe-west)' region of our google cloud project
    // https://vercel.com/docs/concepts/edge-network/regions#region-list
    regions: ['cdg1'],
    typescript: {
        tsconfigPath: 'tsconfig.build.json',
        ignoreBuildErrors: true
    }
};

const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
