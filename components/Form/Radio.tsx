import React from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import {useFormikContext} from 'formik';
import FormField from '@/components/FormField';
import Icon from '@/components/Icon';
import type {RadioField} from '@/types/form';

const getFieldStyles = (hasError: boolean, isChecked: boolean) => {
    if (isChecked) {
        return 'bg-white border-pink-500';
    } else if (hasError) {
        return 'border-red-300';
    } else {
        return 'border-gray-300';
    }
};

const CheckedIcon = () => (
    <Icon name="check" classes="h-8 w-8 transform text-white duration-200 ease-out" />
);

const RadioButton: React.FC<RadioField> = ({
    description,
    disabled = false,
    hasError,
    label,
    name,
    options,
    type,
    ...props
}: RadioField) => {
    const {setFieldValue, values} = useFormikContext();

    const handleChange = value => {
        setFieldValue(name, value);
    };

    return (
        <FormField description={description} label={label} name={name} type={type}>
            <RadioGroup.Root
                className="mt-2 space-y-2 lg:flex lg:flex-wrap lg:space-x-4 lg:space-y-0"
                onValueChange={value => handleChange(value)}
            >
                {options?.map(option => {
                    const isChecked = values[name] === option.value;

                    return (
                        <label
                            key={option.value}
                            className={`${getFieldStyles(
                                hasError,
                                isChecked
                            )} group relative flex flex-shrink-0 flex-grow-0 items-center space-x-2 rounded-full transition duration-200 ease-out hover:border-gray-100 focus:border-gray-100 ${
                                disabled ? 'cursor-default opacity-50' : 'cursor-pointer'
                            }`}
                            style={{background: 'transparent'}}
                        >
                            <RadioGroup.Item
                                checked={isChecked}
                                className={`${
                                    isChecked
                                        ? 'border-pink-500 bg-pink-500'
                                        : 'border-gray-200 bg-white focus:outline-black group-hover:bg-gray-200'
                                } relative flex h-5 w-5 items-center justify-center rounded-full border-2 duration-200 ease-out ${
                                    disabled ? 'cursor-default' : 'cursor-pointer'
                                }`}
                                data-testid="radio-button"
                                disabled={disabled}
                                id={name}
                                name={name}
                                value={option.value}
                            >
                                <RadioGroup.Indicator
                                    asChild
                                    forceMount={
                                        isChecked || process.env.NODE_ENV === 'test'
                                            ? true
                                            : undefined
                                    }
                                >
                                    <CheckedIcon />
                                </RadioGroup.Indicator>
                            </RadioGroup.Item>{' '}
                            <span className="text-sm font-medium leading-tight">
                                {option.label}
                            </span>
                        </label>
                    );
                })}
            </RadioGroup.Root>
        </FormField>
    );
};

export default RadioButton;
