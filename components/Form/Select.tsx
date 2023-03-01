import React from 'react';
import {Field} from 'formik';
import strings from '@/locales/en.json';
import FormField, {getFieldStyles} from '@/components/FormField';
import type {SelectField as SelectFieldType} from '@/types/form';

const SelectField: React.FC<SelectFieldType> = ({
    description,
    disabled,
    hasEmptyField = true,
    label,
    name,
    onChange,
    options,
    placeholder
}: SelectFieldType) => (
    <Field name={name}>
        {({form, meta}) => {
            const hasError = meta.touched && meta.error;

            const handleChange = event => {
                const {value} = event.target;

                form.setFieldValue(name, value);

                if (onChange) {
                    onChange(value);
                }
            };

            return (
                <FormField description={description} label={label} name={name}>
                    <select
                        id={name}
                        name={name}
                        disabled={disabled}
                        className={`${getFieldStyles(
                            hasError
                        )} form-select mt-1 block w-full text-ellipsis rounded-md border px-3 py-2 pr-8 shadow-sm transition duration-150 ease-in-out focus:outline-none sm:text-sm sm:leading-5`}
                        style={hasError ? {backgroundPosition: 'right 2rem center'} : null}
                        onChange={handleChange}
                        value={meta.value}
                    >
                        {hasEmptyField && (
                            <option value="">
                                {placeholder || strings.generic.emptySelectField}
                            </option>
                        )}
                        {options?.map(({label, value}) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </FormField>
            );
        }}
    </Field>
);

export default SelectField;
