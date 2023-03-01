import React, {useState} from 'react';
import Image from 'next/image';
import Form from '@/components/Form';
import Link from '@/components/Link';
import strings from '@/locales/en.json';
import loginSchema from '@/schemas/login';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {firebaseAuth} from '@/utils/firebase';

interface Props {
    handleSuccess: Function;
}

const LoginForm: React.FC<Props> = ({handleSuccess}: Props) => {
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});

    const handleSubmit = async values => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            /**
             * Attempty to sign the user in with their credentials
             */
            const login = await firebaseAuth().signInWithEmailAndPassword(
                values.email,
                values.password
            );

            /**
             * If the sign-in was successful, we need to send the details to our own API so we can save
             * the information in a secure session for re-authorising future requests.
             */
            if (login?.user?.uid) {
                /**
                 * First, we will retrieve the user's token and send that to our API for verification.
                 */
                const token = await firebaseAuth().currentUser.getIdToken();

                if (token) {
                    const {refreshToken} = login.user;

                    try {
                        const saveLogin = await fetch(
                            '/api/login',
                            fetchOptions({
                                body: {
                                    refreshToken,
                                    token
                                },
                                method: 'post'
                            })
                        );

                        handleSuccess();
                    } catch (error) {
                        setFormStatus({
                            feedback: error?.data?.message || error.message,
                            status: RequestType.DEFAULT
                        });
                    }
                } else {
                    setFormStatus({
                        feedback:
                            'A valid token was not provided for this user. Please refresh and try logging-in again.',
                        status: RequestType.ERROR
                    });
                }
            } else {
                setFormStatus({feedback: '', status: RequestType.DEFAULT});
            }
        } catch (error) {
            setFormStatus({feedback: error.message, status: RequestType.DEFAULT});
        }
    };

    return (
        <section className="transition-opacity duration-300">
            <div className="animate-fade-in-up sm:mx-auto sm:w-full sm:max-w-md">
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
        </section>
    );
};

export default LoginForm;
