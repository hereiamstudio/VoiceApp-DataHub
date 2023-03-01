import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {randomBytes} from 'crypto';
import mockSessionAdministrator from '../cypress/fixtures/session-administrator.json';

export const mockProviders = {
    credentials: {
        id: 'credentials',
        name: 'Credentials',
        type: 'credentials',
        authorize: null,
        credentials: null
    }
};

export const mockCSRFToken = {
    csrfToken: randomBytes(32).toString('hex')
};

export const mockCredentialsResponse = {
    ok: true,
    status: 200,
    url: 'https://path/to/credentials/url'
};

export const mockSignOutResponse = {
    ok: true,
    status: 200,
    url: 'https://path/to/signout/url'
};

export const server = setupServer(
    rest.post('/api/auth/signout', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockSignOutResponse))
    ),
    rest.get('/api/auth/session', (req, res, ctx) => {
        res(ctx.status(200), ctx.json(mockSessionAdministrator));
    }),
    rest.get('/api/auth/csrf', (req, res, ctx) => res(ctx.status(200), ctx.json(mockCSRFToken))),
    rest.get('/api/auth/providers', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockProviders))
    ),
    rest.post('/api/auth/callback/credentials', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockCredentialsResponse))
    ),
    rest.post('/api/auth/_log', (req, res, ctx) => res(ctx.status(200)))
);
