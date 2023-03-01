import React from 'react';
import Image from 'next/image';
import {useRouter} from 'next/router';
import {useSession} from 'next-auth/react';
import startsWith from 'lodash/startsWith';
import Icon from '@/components/Icon';
import Link from '@/components/Link';
import RoleRestriction from '@/components/RoleRestriction';
import strings from '@/locales/en.json';

interface Props {
    handleSidebarClose: Function;
}

const SiteSidebarNav: React.FC<Props> = ({handleSidebarClose}: Props) => {
    const router = useRouter();
    const {data: session} = useSession();

    const isLinkActive = (url: string) => {
        if (router) {
            if (url === '/' && router.pathname === '/') {
                return true;
            } else if (url !== '/' && startsWith(router.pathname, url)) {
                return true;
            }
        }

        return false;
    };

    return (
        <>
            <div data-testid="sidebar-main-nav" className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                <div className="mb-2 flex flex-shrink-0 items-center px-4 text-white">
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
                {session?.user?.email && (
                    <nav className="mt-5 space-y-2 px-2">
                        {strings.mainNavigation.links.map((link, index) => {
                            const isActive = isLinkActive(link.url);

                            return (
                                <RoleRestriction
                                    key={link.url}
                                    action={`${link.label.toLowerCase()}:list`}
                                >
                                    <Link
                                        url={link.url}
                                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium leading-6 ${
                                            isActive
                                                ? 'bg-gray-900 text-white focus:bg-gray-700 focus:outline-none'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none'
                                        }  transition duration-150 ease-in-out`}
                                        onClick={handleSidebarClose}
                                    >
                                        <Icon
                                            classes="mr-4 h-6 w-6 text-gray-300 group-hover:text-gray-300 group-focus:text-gray-300 transition ease-in-out duration-150"
                                            name={link.icon}
                                        />
                                        {link.label}
                                    </Link>
                                </RoleRestriction>
                            );
                        })}
                    </nav>
                )}
            </div>
            <div className="flex flex-shrink-0 bg-gray-700 p-4">
                {session?.user?.email && (
                    <Link
                        url="/account"
                        className="group block flex-shrink-0"
                        onClick={handleSidebarClose}
                    >
                        <p className="text-base font-medium leading-6 text-white">
                            {strings.generic.navigationWelcome} {session.user.first_name}
                        </p>
                        <p className="text-sm font-medium leading-5 text-gray-400 transition duration-150 ease-in-out group-hover:text-gray-300">
                            {strings.mainNavigation.editAccount}
                        </p>
                    </Link>
                )}
            </div>
        </>
    );
};

export default SiteSidebarNav;
