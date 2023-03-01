import React, {useContext} from 'react';
import {useFormikContext} from 'formik';
import get from 'lodash/get';
import map from 'lodash/map';
import {FormContext} from '@/components/Form';
import strings from '@/locales/en.json';

interface Props {
    error?: string;
}

export const FormErrorsList = ({errors}: {errors: string[]}) => (
    <div
        className="mt-4 animate-fade-in rounded-md bg-red-50 p-4 sm:mt-6"
        data-testid="form-errors"
    >
        <div className="flex">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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
                    <ul data-testid="form-errors-list" className="list-disc pl-5">
                        {errors.map((message, index) => (
                            <li key={`${message}-${index}`}>{message}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

const FormErrors: React.FC<Props> = ({error}: Props) => {
    const {fields} = useContext(FormContext);
    const {errors, submitCount} = useFormikContext();
    let formattedErrors = map(errors, (value: any, key: string): string => {
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

        return get(fields, [key, 'errors', value], '').toString();
    });

    if (error && !formattedErrors.includes(error)) {
        formattedErrors.push(error);
    }

    if (formattedErrors.length > 0 && submitCount > 0) {
        return <FormErrorsList errors={formattedErrors} />;
    } else {
        return null;
    }
};

export default FormErrors;
