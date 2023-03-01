import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import NextAuth, {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {getUserProfileForLogin, refreshFirebaseToken, signInUser} from './firebase';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Login',
            credentials: {
                email: {label: 'Username', type: 'text', placeholder: 'jsmith'},
                password: {label: 'Password', type: 'password'}
            },
            async authorize(credentials) {
                const user = await signInUser(credentials.email, credentials.password);

                if (user) {
                    return user;
                } else {
                    return null;
                }
            }
        })
    ],
    pages: {signIn: '/login'},
    secret: process.env.NEXTAUTH_SECRET,
    session: {maxAge: 24 * 60 * 60 * 1000, strategy: 'jwt'},
    callbacks: {
        async signIn({user}) {
            return user?.role !== 'enumerator';
        },
        async session({session, token}) {
            session.user = token?.user || session?.user;
            session.refreshToken = token?.refreshToken;

            return session;
        }
    }
};

const authOptionsWithJWT = (req: NextApiRequest) => ({
    ...authOptions,
    callbacks: {
        ...authOptions.callbacks,
        async jwt({account, token, user}) {
            // Initial login
            if (account && user?.id) {
                return {user};
            }

            const tokenUser = token?.user as any;

            // Update param is passed to force a refresh of the user's profile data
            // that gets stored in the session. This is when a user updates their account.
            // if (tokenUser && req.url.includes('/api/auth/session?update')) {
            if (tokenUser && req.url.includes('/api/auth/session?update')) {
                console.log('updating user session from account change');

                try {
                    // If the user profile has been updated we also need to fetch that
                    // https://github.com/nextauthjs/next-auth/issues/371#issuecomment-1006261430

                    const authUser = await getUserProfileForLogin(tokenUser);

                    if (authUser?.uid) {
                        return {...token, user: {...tokenUser, ...authUser}};
                    } else {
                        // console.log('new auth user not found');
                    }
                } catch (error) {
                    // console.log(error);
                    captureException(error);
                    throw new Error(error);
                }
            } else {
                const tokenAndUser = {...token, user: user || tokenUser};

                // Otherwise if the token is within the expiry time, we can just return it
                if (tokenAndUser?.user?.expires && Date.now() < tokenAndUser.user.expires) {
                    return tokenAndUser;
                }
                // Finally, if the token is expired, we need to refresh it
                else if (tokenUser) {
                    const refreshedToken = await refreshFirebaseToken(tokenAndUser);

                    return refreshedToken;
                } else {
                    throw new Error('User or token not found');
                }
            }
        }
    }
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    return await NextAuth(req, res, authOptionsWithJWT(req));
};

export default withSentry(handler);
