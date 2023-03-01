import React, {useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Image from 'next/image';
import {useSession} from 'next-auth/react';
import Banner from '@/components/Banner';
import Form from '@/components/Form';
import Link from '@/components/Link';
import SEO from '@/components/SEO';
import Toast from '@/components/Toast';
import ToastContext from '@/components/Toast/context';
import Transition from '@/components/Transition';
import strings from '@/locales/en.json';
import forgotPasswordSchema from '@/schemas/forgot-password';
import {RequestType} from '@/types/request';
import {firebaseAuth} from '@/utils/firebase';
import Button from '@/components/Button';

interface Props {
    csrfToken: string;
}

const ForgotPasswordPage: React.FC<Props> = ({csrfToken}: Props) => {
    const {data: session, status} = useSession();
    const router = useRouter();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {toastQueue} = useContext(ToastContext);
    const hasRequestedVerification = router?.query?.verificationRequested;

    const handleSubmit = async values => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            process.env.NEXT_PUBLIC_HOST_URL || process.env.VERCEL_URL;
            await firebaseAuth().sendPasswordResetEmail(values.email);

            setFormStatus({feedback: '', status: RequestType.SUCCESS});
        } catch (error) {
            setFormStatus({feedback: error.code, status: RequestType.DEFAULT});
        }
    };

    useEffect(() => {
        if (session?.user) {
            // router.replace('/projects');
        }
    }, [router, session]);

    return (
        <>
            <SEO title={strings.login.title} />
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
                    </div>
                    <div className="animate-fade-in-up mt-4 p-4 animation-delay-300 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="space-y-4 rounded-lg bg-white py-8 px-4 shadow sm:px-10">
                            {formStatus.status !== RequestType.SUCCESS ? (
                                <Form.Container
                                    {...forgotPasswordSchema}
                                    handleSubmit={handleSubmit}
                                    name="login"
                                    status={formStatus.status}
                                >
                                    <Form.Fields />
                                    <Form.Errors />
                                    <div className="mt-4" />
                                    <Form.Submit />
                                    <Button
                                        url="/login"
                                        classes="w-full mt-2 justify-center"
                                        theme="secondary"
                                    >
                                        {strings.login.forgotPassword.cancel}
                                    </Button>
                                </Form.Container>
                            ) : (
                                <div className="mt-3 animate-fade-in text-center">
                                    <p className="mb-4 text-sm leading-5 text-gray-600">
                                        {strings.login.forgotPassword.success}
                                    </p>
                                    <Button url="/login">
                                        {strings.login.forgotPassword.login}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Transition>
            </div>
            <Toast queue={toastQueue} />
        </>
    );
};

export default ForgotPasswordPage;
