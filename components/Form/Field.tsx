import React, {useContext} from 'react';
import {useFormikContext} from 'formik';
import {FormContext} from '@/components/Form';
import Checkbox from '@/components/Form/Checkbox';
import Input from '@/components/Form/Input';
import Radio from '@/components/Form/Radio';
import Select from '@/components/Form/Select';

interface Props {
    index?: number;
    name: string;
    wrapped?: boolean;
}

const FormField: React.FC<Props> = ({index, name}: Props) => {
    const {components, fields, handleChange, options} = useContext(FormContext);
    const {errors, setFieldValue, touched, values} = useFormikContext();
    const hasError = errors.hasOwnProperty(name) && touched.hasOwnProperty(name);
    const sharedProps = {
        hasError,
        name: typeof index === 'number' ? `${name}.${index}` : name
    };
    let field = fields[name];

    // if this field is an array of fields, only the first one has description, etc.
    if (typeof index === 'number' && index > 0) {
        field = {
            ...field,
            description: '',
            label: ''
        };
    }

    if (options?.[name]) {
        // @ts-ignore
        field.options = options[name](values);
    }

    if (field.field === 'input' || field.field === 'textarea') {
        if (field.type === 'boolean' || field.type === 'checkbox') {
            return <Checkbox {...field} {...sharedProps} />;
        } else if (field.type === 'radio') {
            return <Radio {...field} {...sharedProps} />;
        } else {
            return <Input {...field} {...sharedProps} multiline={field.field === 'textarea'} />;
        }
    } else if (field.field === 'select') {
        return <Select {...field} options={field?.options} {...sharedProps} />;
    } else if (field.field === 'component') {
        if (components?.[field.name]) {
            return components?.[field.name]({setFieldValue, values}) || null;
        }
    }

    return null;
};

const WrappedFormField: React.FC<Props> = ({index, name, wrapped}: Props) => {
    const {fields, schema} = useContext(FormContext);
    const isArrayField = schema.fields[name]?.type === 'array';
    const field = fields[name];

    // Handle fields being removed from the schema
    if (!field) {
        return null;
    }

    return (
        <div
            className={`col-span-12 space-y-2 empty:hidden ${
                field.columns && wrapped ? `sm:col-span-${field.columns}` : 'sm:col-span-12'
            }`}
        >
            {isArrayField ? (
                Array.from(Array(field.size).keys()).map(index => (
                    <FormField key={field.name} index={index} name={name} />
                ))
            ) : (
                <FormField index={index} name={name} />
            )}
        </div>
    );
};

export default WrappedFormField;
