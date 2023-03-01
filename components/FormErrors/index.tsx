import React from 'react';
import {useFormikContext} from 'formik';
import get from 'lodash/get';
import map from 'lodash/map';
import strings from '@/locales/en.json';

interface Props {
    error?: string;
    formName: string;
}

const FormErrors: React.FC<Props> = ({error, formName}: Props) => {
    const {errors, submitCount} = useFormikContext();
    const formattedErrors = map(errors, (value: any, key: string) => {
        /**
         * In the event that an array of errors is returned, we'll show the first
         * error in that list.
         */
        if (Array.isArray(value)) {
            const firstError = value.filter(v => v)[0];

            if (firstError) {
                value = Object.values(firstError)[0];
            }
        }

        return get(strings, `${formName}.${key}.${value}`);
    });

    if (error && !formattedErrors.includes(error)) {
        formattedErrors.push(error);
    }

    if (formattedErrors.length > 0 && submitCount > 0) {
        return (
            <div className="mt-4 rounded-md bg-red-50 p-4 sm:mt-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium leading-5 text-red-800">
                            {strings.generic.formError}
                        </h3>
                        <div className="mt-2 text-sm leading-5 text-red-700">
                            <ul data-testid="form-errors" className="list-disc pl-5">
                                {formattedErrors.map((message, index) => (
                                    <li key={`${message}-${index}`}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }
};

export default FormErrors;
