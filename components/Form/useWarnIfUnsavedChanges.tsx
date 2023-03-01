import {useEffect} from 'react';
import {useRouter} from 'next/router';

const useWarnIfUnsavedChanges = (unsavedChanges: boolean, callback?: () => boolean) => {
    const router = useRouter();

    if (!callback) {
        callback = () =>
            confirm(
                'You have unsaved changes in the form. Are you sure you want to leave this page?'
            );
    }

    useEffect(() => {
        if (unsavedChanges) {
            const routeChangeStart = () => {
                const ok = callback();

                if (!ok) {
                    router.events.emit('routeChangeError');
                    throw 'Abort route change. Please ignore this error.';
                }
            };

            router.events.on('routeChangeStart', routeChangeStart);

            return () => {
                router.events.off('routeChangeStart', routeChangeStart);
            };
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unsavedChanges]);

    return unsavedChanges;
};

export default useWarnIfUnsavedChanges;
