import React, {useContext, useEffect} from 'react';
import {useRouter} from 'next/router';
import ActivityIndicator from '@/components/ActivityIndicator';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import fetch, {fetchOptions} from '@/utils/fetch';

const AccountVerificationPage: React.FC = () => {
    const router = useRouter();
    const {userId} = router.query;
    const {addToast} = useContext(ToastContext);

    const updateVerificationStatus = async () => {
        try {
            await fetch(
                `/api/account/${userId}/verify`,
                fetchOptions({body: {email_verified: true}, method: 'put'})
            );

            addToast({
                type: 'success',
                title: strings.accountVerification.success.title,
                text: strings.accountVerification.success.text
            });
            router.replace('/');
        } catch (error) {
            addToast({
                title: strings.generic.formSubmissionError,
                text: error?.data?.message || error.message,
                type: 'error'
            });
        }
    };

    useEffect(() => {
        if (userId) {
            updateVerificationStatus();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <ActivityIndicator />
            <span className="ml-4">{strings.accountVerification.loading}</span>
        </div>
    );
};

export default AccountVerificationPage;
