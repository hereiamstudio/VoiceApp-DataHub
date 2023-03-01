import React, {ReactNode} from 'react';
import {useField, useFormikContext} from 'formik';
import Icon from '@/components/Icon';

interface Props {
    children: ReactNode;
    description?: string;
    inline?: boolean;
    label?: string;
    name: string;
    type?: string;
}

export const getFieldStyles = (hasError: boolean) => {
    if (hasError) {
        return 'pr-24 border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:shadow-outline-red';
    } else {
        return 'border-gray-300 focus:shadow-outline-pink focus:border-pink-300 focus:ring-pink-200 focus:border-pink-300 focus:ring-2';
    }
};

const FormField: React.FC<Props> = ({children, description, inline, label, name, type}: Props) => {
    const [field, meta] = useField(name);
    const {submitCount} = useFormikContext();
    const hasError = meta.error && (meta.touched || submitCount > 0);

    return (
        <>
            <div className={inline ? '-mb-1 flex items-center' : ''}>
                <label
                    htmlFor={name}
                    className="block font-medium leading-5 text-gray-700 sm:text-sm"
                >
                    {label}
                </label>

                <div
                    className={`relative mt-1 ${
                        !inline && `rounded-md ${type !== 'radio' ? 'shadow-sm' : ''}`
                    } ${inline && 'ml-4'}`}
                >
                    {children}
                    {hasError && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <Icon classes="h-5 w-5 text-red-500" name="error" />
                        </div>
                    )}
                </div>
            </div>
            {description && <span className="mt-2 block text-sm text-gray-500">{description}</span>}
        </>
    );
};

export default FormField;
