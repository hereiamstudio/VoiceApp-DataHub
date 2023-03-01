import React from 'react';
import {Field} from 'formik';
import FormField, {getFieldStyles} from '@/components/FormField';

interface Props {
    description?: string;
    errorKey?: string;
    label?: string;
    multiline?: boolean;
    name: string;
    rows?: number;
    type?: string;
    [key: string]: any;
}

const InputText: React.FC<Props> = ({
    description,
    errorKey,
    label,
    multiline = false,
    name,
    rows = 3,
    type = 'text',
    ...props
}: Props) => (
    <Field name={name}>
        {({field, form}) => {
            const hasError = form.touched[field.name] && form.errors[field.name];
            const classes = `${getFieldStyles(
                hasError
            )} mt-1 form-input block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none transition duration-150 ease-in-out sm:text-sm sm:leading-5`;

            return (
                <FormField description={description} label={label} name={name}>
                    {multiline ? (
                        <textarea
                            className={classes}
                            id={name}
                            rows={rows}
                            {...field}
                            {...props}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    ) : (
                        <input
                            className={classes}
                            id={name}
                            type={type}
                            {...field}
                            {...props}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    )}
                </FormField>
            );
        }}
    </Field>
);

export default InputText;
