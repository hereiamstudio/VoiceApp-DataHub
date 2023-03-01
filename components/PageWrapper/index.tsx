import React, {ReactNode, useContext} from 'react';
import Image from 'next/image';
import {useSession} from 'next-auth/react';
import {useRecoilValue} from 'recoil';
import AccountVerificationBanner from '@/components/AccountVerificationBanner';
import ActivityIndicator from '@/components/ActivityIndicator';
import Banner from '@/components/Banner';
import ClientOnly from '@/components/ClientOnly';
import IdleTimeout from '@/components/IdleTimeout';
import SiteSidebar from '@/components/SiteSidebar';
import Toast from '@/components/Toast';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {sidebarStatusState} from '@/utils/store';
import type {Banner as BannerType} from '@/types/index';
import {ModalVisibility} from '@/types/index';

interface Props {
    banner?: BannerType;
    children: ReactNode;
    language?: string;
    showSidebar?: boolean;
    wrapperClasses?: string;
}

const PageWrapper: React.FC<Props> = ({
    banner,
    children,
    language = 'en',
    showSidebar = true,
    wrapperClasses
}: Props) => {
    const {data: session, status} = useSession();
    const isLoading = status === 'loading';
    const sidebarStatus = useRecoilValue(sidebarStatusState);
    const {removeToast, toastQueue} = useContext(ToastContext);

    // Catch stale session where the user object has been removed but the
    // session/jwt email data persists
    if (session?.user?.email && !session?.user?.uid) {
        return (
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="sm:flex sm:items-start sm:justify-between">
                        <div className="mt-2 max-w-2xl text-sm leading-5 text-gray-500">
                            <p>Sorry, your session has expired. Please refresh login again.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-screen bg-gray-100 md:flex">
                <div className="hidden md:flex md:flex-shrink-0">
                    <div className="flex w-64 flex-col bg-gray-800">
                        <div className="mb-2 flex  flex-shrink-0 items-center px-4 pt-5 text-white">
                            <div className="mr-3">
                                <Image
                                    src="/images/logo-100.png"
                                    alt={`${strings.name} logo`}
                                    className="overflow-hidden rounded-lg"
                                    height={40}
                                    objectFit="contain"
                                    quality={80}
                                    width={40}
                                />
                            </div>
                            <div className="text-2xl font-bold leading-9">{strings.name}</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-1 animate-fade-in flex-col items-center justify-center overflow-hidden">
                    <ActivityIndicator />
                </div>
            </div>
        );
    }

    return (
        <ClientOnly>
            <IdleTimeout />
            <div
                className={`h-screen bg-gray-100 md:flex ${
                    sidebarStatus === ModalVisibility.HIDDEN ? '' : 'overflow-hidden'
                }`}
                data-lang={language}
            >
                {showSidebar && <SiteSidebar />}
                <div
                    className="flex flex-1 animate-fade-in flex-col overflow-hidden"
                    id="main-wrapper"
                >
                    <main
                        data-testid="page-wrapper"
                        className="relative z-0 min-h-screen flex-1 overflow-y-auto focus:outline-none"
                        tabIndex={0}
                    >
                        {showSidebar && <AccountVerificationBanner />}
                        {showSidebar && banner && <Banner {...banner} />}
                        <div className="pt-2 pb-6  md:py-6">
                            <div
                                className={
                                    wrapperClasses || 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
                                }
                            >
                                {children}
                            </div>
                            <div className="sm:mb-8" />
                        </div>
                    </main>
                </div>
            </div>
            <Toast handleRemove={removeToast} queue={toastQueue} />
        </ClientOnly>
    );
};

export default PageWrapper;
