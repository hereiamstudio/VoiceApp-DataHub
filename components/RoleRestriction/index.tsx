import React, {ReactNode, useEffect, useRef} from 'react';
import {useRouter} from 'next/router';
import {useSession} from 'next-auth/react';
import {hasClaim} from '@/utils/roles';

interface Props {
    action: string;
    children: ReactNode;
    data?: {[key: string]: any};
    redirect?: string;
}

const RoleRestriction: React.FC<Props> = ({action, children, data, redirect}: Props) => {
    const {data: session} = useSession();
    const isMounted = useRef(false);

    // useEffect(() => {
    //     isMounted.current = true;

    //     return () => {
    //         isMounted.current = false;
    //     };
    // }, []);

    // if (isMounted.current && session?.user) {
    if (session?.user) {
        const isAllowed = hasClaim(session.user.role, action, data);

        if (isAllowed) {
            return <>{children}</>;
        } else if (redirect) {
            // router.replace(redirect);
            return null;
        } else {
            return null;
        }
    }

    return null;
};

export default RoleRestriction;
