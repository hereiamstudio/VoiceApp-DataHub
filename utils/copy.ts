import get from 'lodash/get';
import copy from '@/locales/en.json';

interface DataObject {
    [key: string]: string | number;
}

const replaceKeysWithData = (value: string, data?: DataObject) => {
    const keys = Object.keys(data);
    let replacementValue = value;

    keys.filter(key => value.includes(`%{${key}}`)).forEach(key => {
        replacementValue = replacementValue.replace(`%{${key}}`, data[key]?.toString());
    });

    if (!replacementValue && process.env.NODE_ENV === 'development') {
        console.warn(`no replacement found for: ${value}`);
    }

    return replacementValue;
};

const getValue = (path: string, data?: DataObject) => {
    const rawValue = get(copy, path);

    if (rawValue) {
        if (data) {
            return replaceKeysWithData(rawValue, data);
        } else {
            return rawValue;
        }
    } else {
        return `undefined: ${path}`;
    }
};

export default getValue;
