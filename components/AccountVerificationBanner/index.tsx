import React from 'react';
import {useSession} from 'next-auth/react';
import Banner from '@/components/Banner';
import strings from '@/locales/en.json';

const AccountVerificationBanner: React.FC = () => {
    const {data: session} = useSession();
    let hasUserVerifiedEmail = true;

    if (session?.user?.emailVerified) {
        hasUserVerifiedEmail = !!session.user.emailVerified;
    }

    if (hasUserVerifiedEmail) {
        return null;
    }

    return (
        <Banner
            cta={{label: strings.account.verify.banner.cta, url: '/account'}}
            text={strings.account.verify.banner.text}
        />
    );
};

export default AccountVerificationBanner;
