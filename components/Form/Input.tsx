import React from 'react';
import {Field} from 'formik';
import omit from 'lodash/omit';
import FormField, {getFieldStyles} from '@/components/FormField';
import type {InputField as InputFieldType} from '@/types/form';

const InputField: React.FC<InputFieldType> = ({
    description,
    label,
    multiline = false,
    name,
    rows = 3,
    type = 'text',
    ...props
}: InputFieldType) => (
    <Field name={name}>
        {({field, form}) => {
            const hasError = form.touched[field.name] && form.errors[field.name];
            const classes = `${getFieldStyles(
                hasError
            )} form-input block w-full py-2 px-3 border rounded-md shadow-xs focus:outline-none transition duration-150 ease-in-out sm:text-sm sm:leading-5`;
            const fieldProps = omit(props, ['hasError', 'handleChange']);

            return (
                <FormField description={description} label={label} name={name}>
                    {multiline ? (
                        <textarea
                            className={classes}
                            id={name}
                            rows={rows}
                            {...field}
                            {...fieldProps}
                        />
                    ) : (
                        <input
                            className={classes}
                            id={name}
                            type={type}
                            {...field}
                            {...fieldProps}
                        />
                    )}
                </FormField>
            );
        }}
    </Field>
);

export default InputField;
