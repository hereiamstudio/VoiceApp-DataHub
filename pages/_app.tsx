import React, {useEffect} from 'react';
import type {AppProps} from 'next/app';
import {useRouter} from 'next/router';
import {DefaultSeo} from 'next-seo';
import {RecoilRoot} from 'recoil';
import {SWRConfig} from 'swr';
import {SessionProvider} from 'next-auth/react';
import ModalProvider from '@/components/Modal/provider';
import ToastProvider from '@/components/Toast/provider';
import TailwindPurgeList from '@/components/TailwindPurgeList';
import {initGA, logPageView} from '@/utils/analytics';
import fetch from '@/utils/fetch';
import strings from '@/locales/en.json';
import '../public/tailwind-base.css';

declare global {
    interface Window {
        GA_INITIALIZED?: boolean;
    }
}

const CustomApp = ({Component, pageProps}: AppProps) => {
    const router = useRouter();

    useEffect(() => {
        if (!window.GA_INITIALIZED) {
            initGA();
            window.GA_INITIALIZED = true;
        }

        logPageView();

        router.events.on('routeChangeStart', logPageView);

        return () => {
            router.events.off('routeChangeStart', logPageView);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <DefaultSeo {...strings.seo} />
            <SWRConfig
                value={{
                    fetcher: fetch,
                    revalidateOnReconnect: false,
                    revalidateOnFocus: false,
                    shouldRetryOnError: false
                }}
            >
                <SessionProvider session={pageProps.session}>
                    <RecoilRoot>
                        <ModalProvider>
                            <ToastProvider>
                                <Component {...pageProps} />
                            </ToastProvider>
                        </ModalProvider>
                    </RecoilRoot>
                </SessionProvider>
            </SWRConfig>
            <TailwindPurgeList />
        </>
    );
};

export default CustomApp;
