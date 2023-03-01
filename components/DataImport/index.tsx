import React, {useContext, useState} from 'react';
import {Formik, Form} from 'formik';
import Button from '@/components/Button';
import DataImportField from '@/components/DataImport/field';
import ToastContext from '@/components/Toast/context';
import Icon from '@/components/Icon';
import strings from '@/locales/en.json';
import dataImportSchema from '@/schemas/dataImport';
import {RequestType} from '@/types/request';
import fetch from '@/utils/fetch';

interface Props {
    handleUploaded: Function;
    model: string;
    text: string;
    validationErrors?: any;
}

const combineValidationAndFormErrors = (validationErrors, formErrors) => {
    let errors = [];

    if (validationErrors?.length) {
        errors = [...validationErrors];
    }

    if (Object.keys(formErrors).length) {
        errors = [...errors, ...Object.keys(formErrors).map(key => formErrors[key])];
    }

    return errors;
};

const DataImport: React.FC<Props> = ({handleUploaded, model, text, validationErrors}: Props) => {
    const {addToast} = useContext(ToastContext);
    const [fileWithValidationErrors, setFileWithValidationErrors] =
        useState<[string, string]>(null);
    const [formStatus, setFormStatus] = useState<RequestType>(RequestType.DEFAULT);

    const handleFormSubmit = async values => {
        setFileWithValidationErrors(null);
        setFormStatus(RequestType.PENDING);

        try {
            const formData = new FormData();
            formData.append('file', values.file);

            const response = await fetch(`/api/data-import?model=${model}`, {
                body: formData,
                headers: {},
                method: 'POST'
            });

            handleUploaded(response);
        } catch (error) {
            addToast({
                title: 'Import error',
                text: error?.message || '',
                type: 'error'
            });
        } finally {
            setFormStatus(RequestType.DEFAULT);
        }
    };

    return (
        <div className="space-y-4">
            <Formik
                initialValues={{file: ''}}
                onSubmit={() => {}}
                validationSchema={dataImportSchema}
            >
                {({errors, values}) => {
                    const combinedErrors = combineValidationAndFormErrors(validationErrors, errors);

                    return (
                        <Form
                            autoComplete="off"
                            data-testid="bulk-upload-form"
                            className="space-y-4 md:space-y-4 md:space-x-4"
                        >
                            <div className="mb-6 overflow-hidden rounded-lg bg-white p-4 shadow-sm">
                                <div
                                    className="text-md mb-4 text-gray-500 sm:text-sm"
                                    dangerouslySetInnerHTML={{__html: text}}
                                />
                                <div className="flex items-center space-x-4">
                                    <div className="flex-grow">
                                        <DataImportField />
                                    </div>
                                    <Button
                                        disabled={!values.file || Object.values(errors).length > 0}
                                        onClick={() => handleFormSubmit(values)}
                                        status={formStatus}
                                        type="submit"
                                    >
                                        {strings.usersList.import.confirm}
                                        <Icon classes="h-6 ml-2 wico-6" name="upload" />
                                    </Button>
                                </div>
                                {combinedErrors.length > 0 && (
                                    <div className="mt-4 rounded bg-red-50 p-6 text-sm text-red-600">
                                        <div className="flex items-center space-x-2">
                                            <svg
                                                className="h-5 w-5 flex-shrink-0 text-red-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <strong className="font-medium">
                                                There are validation errors on this entry. Please
                                                fix and upload again.
                                            </strong>
                                        </div>
                                        <ul className="list-outside list-disc space-y-2 pl-6 pt-2">
                                            {combinedErrors.map(error => (
                                                <li key={error.error}>
                                                    <strong className="mb-1 block font-semibold text-red-700">
                                                        Row {error.row}
                                                    </strong>
                                                    <span
                                                        className="space-y-1"
                                                        dangerouslySetInnerHTML={{
                                                            __html: error.error
                                                        }}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default DataImport;
