import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Image from 'next/image';
import {getCsrfToken, signIn, useSession} from 'next-auth/react';
import Banner from '@/components/Banner';
import Form from '@/components/Form';
import Link from '@/components/Link';
import SEO from '@/components/SEO';
import Toast from '@/components/Toast';
import ToastContext from '@/components/Toast/context';
import Transition from '@/components/Transition';
import strings from '@/locales/en.json';
import loginSchema from '@/schemas/login';
import {RequestType} from '@/types/request';
import useRunOnlyOnMount from '@/components/PageWrapper/useRunOnlyOnMount';

interface Props {
    csrfToken: string;
}

const LoginPage: React.FC<Props> = ({csrfToken}: Props) => {
    const {data: session, status} = useSession();
    const router = useRouter();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast, toastQueue} = useContext(ToastContext);
    const hasRequestedVerification = router?.query?.verificationRequested;

    const handleSubmit = async values => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            const res = await signIn('credentials', {
                csrfToken,
                redirect: false,
                email: values.email,
                password: values.password,
                callbackUrl: `${window.location.origin}`
            });

            if (res?.error) {
                setFormStatus({feedback: res.error, status: RequestType.DEFAULT});
            } else if (res.url) {
                router.replace(res.url);
            }
        } catch (error) {
            setFormStatus({feedback: error.message, status: RequestType.DEFAULT});
        }
    };

    useRunOnlyOnMount(() => {
        // If a user has been redirected back to the login page we'll tell
        // them why.
        if (router.query?.callbackUrl) {
            addToast({
                text: strings.login.redirected,
                title: 'Login required',
                type: 'error'
            });
        }
    });

    return (
        <>
            <SEO title={strings.login.title} />
            {hasRequestedVerification && <Banner text={strings.login.verificationRequested} />}
            <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
                <Transition
                    show={status !== 'loading'}
                    enter="transition ease-in-out duration-700"
                    enterFrom="opacity-0 translate-y-5"
                    enterTo="opacity-100 translate-y-0"
                >
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="mt-6 flex items-center justify-center text-gray-900">
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

                            <h2 className="text-center text-3xl font-extrabold leading-9">
                                {strings.login.title}
                            </h2>
                        </div>
                        <p className="max-w mt-3 text-center text-sm leading-5 text-gray-600">
                            {strings.login.text}
                        </p>
                    </div>
                    <div className="animate-fade-in-up mt-4 p-4 animation-delay-300 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="rounded-lg bg-white py-8 px-4 shadow sm:px-10">
                            <Form.Container
                                {...loginSchema}
                                handleSubmit={handleSubmit}
                                name="login"
                                status={formStatus.status}
                            >
                                <Form.Fields />
                                <Link
                                    classes="inline-block mt-2 text-gray-500 text-sm"
                                    url="/forgot-password"
                                >
                                    {strings.login.forgotPassword.title}
                                </Link>
                                <Form.Errors error={formStatus.feedback} />
                                <div className="mt-4">
                                    <Form.Submit />
                                </div>
                            </Form.Container>
                        </div>
                    </div>
                </Transition>
            </div>
            <Toast queue={toastQueue} />
        </>
    );
};

export const getServerSideProps = async context => {
    return {props: {csrfToken: await getCsrfToken(context)}};
};

export default LoginPage;
