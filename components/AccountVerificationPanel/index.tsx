import React, {useEffect, useState} from 'react';
import {signOut, useSession} from 'next-auth/react';
import Cookies from 'js-cookie';
import {sendVerificationEmail} from '@/utils/firebase/user';
import ActionPanel from '@/components/ActionPanel';
import strings from '@/locales/en.json';
import {RequestType} from '@/types/request';

const AccountVerificationPanel: React.FC = () => {
    const {data: session} = useSession();
    const [hasRequested, setHasRequested] = useState(null);
    const [fetchState, setFetchState] = useState<RequestType>(RequestType.DEFAULT);

    const checkVerificationStatus = () => {
        const request = Cookies.get('verificationRequest');
        const hasUserRequested = request ? request === session.user.uid : false;

        setHasRequested(hasUserRequested);
    };

    const handleRequestSuccess = async () => {
        Cookies.set('verificationRequest', session.user.uid);
        setFetchState(RequestType.DEFAULT);
        setHasRequested(true);

        await signOut();
    };

    const sendUserEmailVerification = async () => {
        try {
            await sendVerificationEmail(session.user.uid);
            handleRequestSuccess();
        } catch (error) {
            alert(error);
            setFetchState(RequestType.DEFAULT);
        }
    };

    const handleVerifyClick = () => {
        if (!hasRequested || fetchState === RequestType.DEFAULT) {
            setFetchState(RequestType.PENDING);
            sendUserEmailVerification();
        }
    };

    useEffect(() => {
        checkVerificationStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ActionPanel
            cta={
                hasRequested !== null
                    ? {
                          disabled: hasRequested || fetchState === RequestType.PENDING,
                          icon: hasRequested ? 'clock' : '',
                          label: hasRequested
                              ? strings.account.verify.pending
                              : strings.account.verify.cta,
                          onClick: handleVerifyClick,
                          state: fetchState,
                          theme: hasRequested ? 'grey' : 'primary'
                      }
                    : null
            }
            text={strings.account.verify.text}
            title={strings.account.verify.title}
        />
    );
};

export default AccountVerificationPanel;
