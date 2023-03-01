import React, {ReactNode} from 'react';
import {Formik, Form} from 'formik';
import FormErrors from '@/components/Form/Errors';
import FormFields from '@/components/Form/Fields';
import FormSubmit from '@/components/Form/Submit';
import type {Form as FormType} from '@/types/form';
import {getDefaultFieldValues, getSchemaDefaultFieldValues} from '@/utils/helpers';

export const FormContext = React.createContext<FormType>(null);

type ChildProps = {children: (formikProps: any) => ReactNode} | {children: ReactNode};
type Props = FormType & ChildProps;

const FormContainer: React.FC<Props> = ({
    children,
    components,
    fields,
    handleChange,
    handleSubmit,
    initialValues,
    name,
    options,
    schema,
    status,
    submitLabel = 'Submit',
    withFields
}: Props) => {
    return (
        <FormContext.Provider
            value={{
                components,
                fields,
                handleChange,
                handleSubmit,
                initialValues,
                name,
                options,
                schema,
                status,
                submitLabel,
                withFields
            }}
        >
            <Formik
                enableReinitialize={true}
                initialValues={{
                    ...getSchemaDefaultFieldValues(schema.fields),
                    ...getDefaultFieldValues(fields),
                    ...(initialValues || {})
                }}
                onSubmit={handleSubmit}
                validationSchema={schema}
            >
                {formikProps => (
                    <Form name={name} data-testid={`${name}-form`} autoComplete="off">
                        {typeof children === 'function' ? children(formikProps) : children}
                    </Form>
                )}
            </Formik>
        </FormContext.Provider>
    );
};

const FormExport = {
    Container: FormContainer,
    Errors: FormErrors,
    Fields: FormFields,
    Submit: FormSubmit
};

export default FormExport;
