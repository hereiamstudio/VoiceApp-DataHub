import React from 'react';
import {useRecoilState} from 'recoil';
import SiteSidebarNav from '@/components/SiteSidebarNav';
import {sidebarStatusState} from '@/utils/store';
import {ModalVisibility} from '@/types/index';

const SiteSidebar: React.FC = () => {
    const [sidebarStatus, setSidebarStatus] = useRecoilState(sidebarStatusState);

    const handleSidebarToggle = () => {
        if (sidebarStatus === ModalVisibility.HIDDEN) {
            setSidebarStatus(ModalVisibility.VISIBLE);
        } else {
            setSidebarStatus(ModalVisibility.LEAVING);
            setTimeout(() => setSidebarStatus(ModalVisibility.HIDDEN), 300);
        }
    };

    return (
        <>
            <div
                data-testid="mobile-menu"
                className={`md:hidden ${
                    sidebarStatus === ModalVisibility.HIDDEN ? 'invisible' : 'visible'
                }`}
            >
                <div className="fixed inset-0 z-40 flex">
                    <div
                        className={`fixed inset-0 transition-all duration-300 ${
                            sidebarStatus === ModalVisibility.HIDDEN ? 'opacity-0' : 'opacity-1'
                        }`}
                    >
                        <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
                    </div>
                    <div
                        className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 transition-all duration-300"
                        style={{
                            transform: `translateX(${
                                sidebarStatus === ModalVisibility.VISIBLE ? '0' : '-100vw'
                            })`
                        }}
                    >
                        <div className="absolute top-0 right-0 -mr-14 p-1">
                            <button
                                data-testid="sidebar-toggle"
                                className="flex h-12 w-12 items-center justify-center rounded-full focus:bg-gray-600 focus:outline-none"
                                aria-label="Close sidebar"
                                onClick={handleSidebarToggle}
                            >
                                <svg
                                    className="h-6 w-6 text-white"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <SiteSidebarNav handleSidebarClose={handleSidebarToggle} />
                    </div>
                    <div className="w-14 flex-shrink-0"></div>
                </div>
            </div>

            <div data-testid="desktop-menu" className="hidden md:flex md:flex-shrink-0">
                <div className="flex w-64 flex-col bg-gray-800">
                    <SiteSidebarNav handleSidebarClose={handleSidebarToggle} />
                </div>
            </div>
            <div data-testid="mobile-menu-toggle" className="pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
                <button
                    className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 transition duration-150 ease-in-out hover:text-gray-900 focus:bg-gray-200 focus:outline-none"
                    aria-label="Open sidebar"
                    onClick={handleSidebarToggle}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </div>
        </>
    );
};

export default SiteSidebar;
