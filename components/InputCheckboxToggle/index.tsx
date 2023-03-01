import React from 'react';
import {Field} from 'formik';
import FormField from '@/components/FormField';

interface Props {
    description?: string;
    isDisabled?: boolean;
    handleChange?: Function;
    label?: string;
    name: string;
}

const InputText: React.FC<Props> = ({
    description,
    isDisabled,
    handleChange,
    label,
    name
}: Props) => (
    <Field name={name}>
        {({field, form}) => {
            const isActive = field.value === true;

            return (
                <FormField description={description} inline={true} label={label} name={name}>
                    <button
                        aria-checked={isActive}
                        className={`${
                            isActive ? 'bg-pink-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isDisabled ? 'pointer-events-none opacity-25' : 'focus:shadow-outline'
                        }`}
                        id={name}
                        onClick={() => {
                            if (isDisabled) {
                                return;
                            }

                            if (handleChange) {
                                handleChange(name, !isActive);
                            }

                            form.setFieldValue(name, !isActive);
                        }}
                        role="checkbox"
                        tabIndex={0}
                        type="button"
                    >
                        <span
                            aria-hidden="true"
                            className={`${
                                isActive ? 'translate-x-5' : 'translate-x-0'
                            } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                        ></span>
                    </button>
                </FormField>
            );
        }}
    </Field>
);

export default InputText;
