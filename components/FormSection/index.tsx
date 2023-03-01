import React, {ReactNode} from 'react';
import Button from '@/components/Button';
import FormErrors from '@/components/FormErrors';
import strings from '@/locales/en.json';
import {RequestType} from '@/types/request';

interface Props {
    children: ReactNode;
    error?: string;
    isLocked?: boolean;
    name?: string;
    showForm?: boolean;
    showSubmit?: boolean;
    sideChildren?: ReactNode;
    status?: RequestType;
    submitLabel?: string;
    text?: string;
    title?: string;
}

const FormSection: React.FC<Props> = ({
    children,
    error,
    isLocked,
    name,
    showForm = true,
    showSubmit = true,
    sideChildren,
    status = RequestType.DEFAULT,
    submitLabel = strings.generic.save,
    text,
    title = ''
}: Props) => (
    <section id={title.replace(' ', '').toLowerCase()}>
        <div className="relative -mx-4 sm:mx-0 lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-1">
                <div className="top-4 px-4 sm:sticky sm:px-0">
                    {title && (
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                    )}
                    {text && <p className="mt-1 text-sm leading-5 text-gray-600">{text}</p>}
                    {sideChildren && <div className="mt-4">{sideChildren}</div>}
                </div>
            </div>
            <div className="relative mt-5 lg:col-span-2 lg:mt-0">
                {showForm ? (
                    <>
                        <div className="shadow sm:overflow-hidden sm:rounded-md">
                            <div className="bg-white px-4 py-5 sm:p-6">{children}</div>

                            {!isLocked && showSubmit && (
                                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                                    <Button
                                        data-testid="form-submit"
                                        disabled={status !== RequestType.DEFAULT}
                                        state={status}
                                        type="submit"
                                    >
                                        {submitLabel}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="relative px-4 py-5 lg:p-0">{children}</div>
                )}
                {isLocked && (
                    <div className="absolute left-0 top-0 h-full w-full bg-white bg-opacity-50" />
                )}
            </div>
        </div>
    </section>
);

export default FormSection;
