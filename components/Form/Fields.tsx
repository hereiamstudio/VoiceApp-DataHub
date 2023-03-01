import React, {useContext, useEffect} from 'react';
import {useFormikContext} from 'formik';
import {FormContext} from '@/components/Form';
import FormField from '@/components/Form/Field';
import RequestType from '@/types/request';

const FormFields: React.FC = () => {
    const {fields, handleChange, status} = useContext(FormContext);
    const {values} = useFormikContext();
    const fieldsAsArray = Object.keys(fields).map(fieldName => ({
        ...fields[fieldName],
        name: fieldName
    }));
    const isDisabled = status === RequestType.PENDING;

    useEffect(() => {
        if (handleChange) {
            handleChange(values);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values]);

    return (
        <div className={isDisabled ? 'pointer-events-none opacity-40' : ''}>
            <div className="grid grid-cols-12 gap-5">
                {fieldsAsArray
                    .filter(field => field?.type !== 'hidden')
                    .map(field => (
                        <FormField {...field} wrapped={true} key={field.name} name={field.name} />
                    ))}
            </div>
            {fieldsAsArray
                .filter(field => field?.type === 'hidden')
                .map(field => (
                    <FormField {...field} key={field.name} name={field.name} />
                ))}
        </div>
    );
};

export default FormFields;
