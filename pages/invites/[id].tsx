import React, {useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {useSession} from 'next-auth/react';
import Image from 'next/image';
import useSWR from 'swr';
import {Formik, Form} from 'formik';
import ActivityIndicator from '@/components/ActivityIndicator';
import Button from '@/components/Button';
import FormErrors from '@/components/FormErrors';
import InputText from '@/components/InputText';
import Link from '@/components/Link';
import PasswordCriteria from '@/components/PasswordCriteria';
import SEO from '@/components/SEO';
import Toast from '@/components/Toast';
import ToastContext from '@/components/Toast/context';
import registerSchema from '@/schemas/register';
import strings from '@/locales/en.json';
import {RequestType} from '@/types/request';
import copy from '@/utils/copy';
import fetch, {fetchOptions} from '@/utils/fetch';

const InvitePage = () => {
    const router = useRouter();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const [isInviteValid, setIsInviteValid] = useState<boolean>(false);
    const {data: session} = useSession();
    const {addToast, clearToastQueue, toastQueue} = useContext(ToastContext);
    const {data: invite, error: inviteError} = useSWR(
        router.query?.id ? `/api/invites/${router.query.id}` : null
    );

    const handleAccepted = () => {
        setFormStatus({
            feedback:
                strings.register.success[
                    invite.user.role === 'enumerator' ? 'textEnumerator' : 'text'
                ],
            status: RequestType.SUCCESS
        });
    };

    const handleFormSubmit = async (values: Object) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(
                `/api/invites/register`,
                fetchOptions({
                    body: {...invite, ...values, ...{id: router.query.id}},
                    method: 'post'
                })
            );
            await fetch('/api/auth/session?update=auth', {
                method: 'GET',
                credentials: 'include'
            });

            addToast({
                title: strings.register.success.title,
                text: strings.register.success.text,
                type: 'success'
            });
            handleAccepted();
        } catch (error) {
            addToast({
                title: strings.generic.formSubmissionError,
                text: error?.data?.message || error.message,
                type: 'error'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
        }
    };

    useEffect(() => {
        if (inviteError || invite?.status === 'revoked') {
            addToast({
                text: strings.register.error.text,
                title: strings.register.error.title,
                type: 'error'
            });
            router.replace('/login');
        } else if (invite) {
            setIsInviteValid(true);

            if (invite.status === 'accepted') {
                handleAccepted();
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invite, inviteError]);

    useEffect(() => {
        if (session?.user?.uid) {
            router.push('/');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user]);

    return (
        <>
            <SEO title={strings.login.title} />
            <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
                <div className="animate-fade-in-up sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="mb-4 flex items-center justify-center text-gray-900">
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
                    {!isInviteValid && (
                        <div className="m-auto h-5 w-5 text-gray-500">
                            <ActivityIndicator />
                        </div>
                    )}
                </div>

                {isInviteValid && (
                    <div className="animate-fade-in-up p-4 sm:mx-auto sm:w-full sm:max-w-md">
                        {formStatus.status !== RequestType.SUCCESS && (
                            <p className="max-w text-center text-gray-600">
                                {copy('register.text', {
                                    name: `${invite.created_by.first_name} ${invite.created_by.last_name}`
                                })}
                            </p>
                        )}
                        <div className="mt-6 rounded-lg bg-white p-8 shadow">
                            {formStatus.status !== RequestType.SUCCESS ? (
                                <Formik
                                    enableReinitialize={true}
                                    initialValues={{password: '', confirm_password: ''}}
                                    onSubmit={handleFormSubmit}
                                    validationSchema={registerSchema}
                                >
                                    {({values}) => (
                                        <Form data-testid="account-register-form">
                                            <div className="grid gap-4">
                                                <InputText
                                                    autoComplete="off"
                                                    label={strings.register.password.label}
                                                    name="password"
                                                    type="password"
                                                />
                                                <PasswordCriteria
                                                    criteria={strings.passwordCriteria}
                                                    // @ts-ignore
                                                    password={values.password}
                                                />
                                                <InputText
                                                    autoComplete="off"
                                                    label={strings.register.confirm_password.label}
                                                    name="confirm_password"
                                                    type="password"
                                                />
                                            </div>
                                            <FormErrors
                                                error={
                                                    formStatus.feedback
                                                        ? strings.register[formStatus.feedback] ||
                                                          formStatus.feedback
                                                        : null
                                                }
                                                formName="register"
                                            />
                                            <Button
                                                classes="justify-center mt-4 w-full"
                                                disabled={formStatus.status !== RequestType.DEFAULT}
                                                state={formStatus.status}
                                                type="submit"
                                            >
                                                {strings.register.submit}
                                            </Button>
                                        </Form>
                                    )}
                                </Formik>
                            ) : (
                                <div className="max-w space-y-4 text-center text-gray-600">
                                    <p>{formStatus.feedback}</p>
                                    {invite?.user?.role !== 'enumerator' && (
                                        <Button url="/login">Login</Button>
                                    )}
                                </div>
                            )}
                        </div>
                        {formStatus.status !== RequestType.SUCCESS && (
                            <p className="max-w mt-4 text-center text-sm leading-5 text-gray-600">
                                {strings.register.loginToAccount}{' '}
                                <Link className="font-medium underline" url="/login">
                                    Login
                                </Link>
                            </p>
                        )}
                    </div>
                )}
            </div>
            <Toast queue={toastQueue} />
        </>
    );
};

export default InvitePage;
