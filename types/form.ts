import type {FormikHelpers} from 'formik';
import Request from '@/types/request';

export interface FormField {
    columns?: number;
    description?: string;
    errors?: {[key: string]: string};
    field: string;
    label?: string;
    name?: string;
    options?: {label: string; value: string}[];
    placeholder?: string;
    size?: number;
    type?: string;
    value?: string | number | boolean;
}

export interface RenderedFormField extends FormField {
    disabled?: boolean;
    handleChange?: Function;
    hasError: boolean;
    value?: string | number | boolean;
}

export interface FormFieldOptions {
    label: string;
    value: string;
}

export interface InputField extends RenderedFormField {
    multiline?: boolean;
    rows?: number;
}

export interface CheckboxField extends RenderedFormField {
    options?: FormFieldOptions[];
    onChange?: (value: boolean | string) => void;
}

export interface RadioField extends RenderedFormField {
    options?: FormFieldOptions[];
    onChange?: (value: boolean | string) => void;
}

export interface SelectField extends RenderedFormField {
    hasEmptyField?: boolean;
    options?: FormFieldOptions[];
    onChange?: (value: string) => void;
}

export interface Form {
    components?: {
        [componentName: string]: (values: any) => any;
    };
    fields: {[fieldName: string]: FormField};
    handleChange?: Function;
    handleSubmit: (
        values: {[key: string]: string | number | boolean},
        actions: FormikHelpers<{[key: string]: string | number | boolean}>
    ) => void | Promise<any>;
    initialValues?: {[key: string]: boolean | number | string} | any;
    // | {[key: string]: {id: string; title: string}}
    name: string;
    options?: {
        [fieldName: string]: (values?: {[key: string]: string}) => FormFieldOptions[];
    };
    schema: any;
    status: Request;
    submitLabel?: string;
    withFields?: boolean;
}
