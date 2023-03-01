import {mixed, object, ObjectSchema} from 'yup';

export interface DataImportForm {
    file: any;
}

export const ALLOWED_EXTENSIONS = ['xlsm', 'xls'];
export const ALLOWED_TYPES = [
    'application/vnd.ms-excel',
    'application/xls',
    'application/xlsx',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    'application/vnd.ms-excel.sheet.macroenabled.12',
    'application/vnd.ms-excel.template.macroenabled.12',
    'application/vnd.ms-excel.addin.macroenabled.12',
    'application/vnd.ms-excel.sheet.binary.macroenabled.12'
];

export const isValidFileType = (type = '', allowedTypes: string[] = ALLOWED_TYPES) => {
    return allowedTypes.includes(type.toLowerCase());
};

const schema: ObjectSchema<DataImportForm> = object().shape({
    file: mixed()
        .required('empty')
        .test('fileType', `Sorry, that file type is not supported`, value => {
            return isValidFileType(value?.type);
        })
});

export default schema;
