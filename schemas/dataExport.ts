import {object, ObjectSchema, string} from 'yup';

const schema: ObjectSchema = object().shape({
    language: string().required('empty'),
    type: string().required('empty'),
    fields: string().nullable()
});

const fields = {
    fields: {field: 'input', type: 'hidden'},
    fieldsSelector: {
        columns: 12,
        field: 'component',
        name: 'FieldsSelector'
    },
    language: {
        errors: {empty: 'Please select a language'},
        field: 'input',
        type: 'hidden'
    },
    languageSelector: {
        columns: 4,
        field: 'component',
        name: 'ExportLanguageSelector'
    },
    type: {
        columns: 4,
        errors: {empty: 'Please select a file type'},
        field: 'select',
        options: [
            {label: 'CSV', value: 'csv'},
            {label: 'Excel', value: 'excel'}
        ],
        label: 'File type',
        value: 'csv'
    }
};

export const exportSchema = {fields, schema};
