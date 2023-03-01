import {NextResponse, NextRequest} from 'next/server';
import type {JWT} from 'next-auth/jwt';
import {withAuth} from 'next-auth/middleware';
import apiStrings from '@/locales/api/en.json';
import {hasClaim} from '@/utils/roles';
import {API_PERMISSIONS, PAGE_PERMISSIONS} from '@/utils/roles-routes';

const getHostUrl = () => {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
    } else if (process.env.VERCEL_ENV === 'production') {
        return process.env.NEXT_PUBLIC_HOST_URL;
    } else {
        return `https://${process.env.VERCEL_URL}`;
    }
};

const ALLOWED_PATHS = ['/login', '/forgot-password', '/invites/', '/api/invites/'];
const HOST_URL = getHostUrl();

const isAnAllowedPath = pathname => {
    return (
        ALLOWED_PATHS.includes(pathname) || ALLOWED_PATHS.some(path => pathname.startsWith(path))
    );
};

const Api401 = () => {
    return new Response(
        JSON.stringify({
            error: 'api_authentication_failed',
            message: apiStrings.errors.api_authentication_failed
        }),
        {status: 401, headers: {'Content-Type': 'application/json'}}
    );
};

const DataHub401 = () => {
    return NextResponse.redirect(`${HOST_URL}/login`);
};

const middleware = withAuth(
    (req: NextRequest & {nextauth: {token: JWT}}) => {
        return NextResponse.next();

        // const pageName = req.page?.name;

        // if (pageName) {
        //     const {pathname} = req.nextUrl;
        //     const isApiPage = pageName.includes('/api');

        //     // If we have a token we need to validate the user's ability to view this page
        //     // If a token does not include the user information that means there was an error
        //     // in the authentication process.
        //     // @ts-ignore
        //     if (req.nextauth?.token?.user?.uid) {
        //         const permission = isApiPage
        //             ? API_PERMISSIONS[pageName]
        //             : PAGE_PERMISSIONS[pageName];

        //         // If the user is not allowed to view this page, take them back to the home page
        //         // @ts-ignore
        //         if (!hasClaim(req.nextauth.token.user.role, permission)) {
        //             if (isApiPage) {
        //                 return Api401();
        //             } else {
        //                 return NextResponse.redirect(process.env.NEXT_PUBLIC_HOST_URL);
        //             }
        //         }
        //     }
        // }

        // return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({req, token}) => {
                // Ignore assets and static files.
                // https://github.com/vercel/next.js/issues/31721
                const publicFiles = /^\/(images|user-templates|robots)\/.*\.*$/g;
                const {pathname} = req.nextUrl;

                if (isAnAllowedPath(pathname) || pathname.match(publicFiles)) {
                    return true;
                }

                // console.log(
                //     'is authorised: ' + token?.user?.uid && token?.user?.expires > Date.now()
                // );
                // @ts-ignore
                return token?.user?.uid && token?.user?.expires > Date.now();
            }
        },
        pages: {
            error: `${HOST_URL}/error`,
            signIn: `${HOST_URL}/login`,
            signOut: `${HOST_URL}/login`
        }
    }
);

export default middleware;
