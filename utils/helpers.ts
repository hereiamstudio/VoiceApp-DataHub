import type {Form} from '@/types/form';
import capitalize from 'lodash/capitalize';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';
import snakeCase from 'lodash/snakeCase';
import trim from 'lodash/trim';
import zipObject from 'lodash/zipObject';

export const humanise = (string: string) => {
    return capitalize(trim(snakeCase(string).replace(/_id$/, '').replace(/_/g, ' ')));
};

export const pluralise = (count: number, word: string, suffix: string = 's') => {
    return `${word}${count == 1 ? '' : suffix}`;
};

export const getHighestRole = (roles: Array<string> = []) => {
    if (roles.includes('Administrator')) {
        return 'Administrator';
    } else if (roles.includes('Assessment Lead')) {
        return 'Assessment Lead';
    } else if (roles.includes('Enumerator')) {
        return 'Enumerator';
    }
};

interface YupSchemaField {
    _type: string;
}

export const getSchemaDefaultFieldValues = (fields: YupSchemaField[]) => {
    const keys = Object.keys(fields);
    const values = map(fields, f => {
        // eslint-disable-next-line no-underscore-dangle
        if (f._type === 'boolean') {
            return false;
        } else if (f._type === 'number') {
            return 0;
        } else if (f._type === 'array') {
            return [];
        } else {
            return '';
        }
    });

    return zipObject(keys, values);
};

export const getDefaultFieldValues = (fields: Form['fields']) => {
    const keys = Object.keys(fields);
    const values = map(fields, f => f?.value);

    return pickBy(zipObject(keys, values), v => v);
};

export const includesAlphaNumeric = (value: string) => {
    const lower = value.match(/[a-z]/);
    const upper = value.match(/[A-Z]/);
    const number = value.match(/[0-9]/);

    return lower !== null && upper !== null && number !== null;
};

export const getMessageFromError = (error: any, fallbackMessage: string = '') => {
    if (error) {
        /**
         * 1. Simple string returned for an error.
         * 2. A formatted error response returned from the API
         * 3. A formatted error returned from a rutime error
         */
        if (typeof error === 'string') {
            /* [1] */
            return error;
        } else if (error?.data?.message) {
            /* [2] */
            return error.data.message;
        } else if (error.message) {
            /* [3] */
            return error.message;
        }
    } else {
        return fallbackMessage;
    }
};

export const getUrlParamsFromObject = (values: Object = {}) => {
    return Object.entries(values)
        .map(([key, val]) => `${key}=${val}`)
        .join('&');
};

export const getFixedPercent = (percent: number = 0) => {
    return percent.toFixed(1).replace('.0', '');
};

export const getDateFromTimestamp = date => {
    if (date?.toDate) {
        return date.toDate();
    } else {
        return new Date(date);
    }
};

export const getMedian = (values: number[]) => {
    const sortedValues = values.sort();

    if (sortedValues.length % 2 === 0) {
        return (
            (sortedValues[sortedValues.length / 2] + sortedValues[sortedValues.length / 2 - 1]) / 2
        );
    }

    return sortedValues[(sortedValues.length - 1) / 2];
};

export const getAverage = (values: number[]) => {
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;

    return average;
};

/**
 * https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
 */
const editDistance = (string1, string2) => {
    string1 = string1.toLowerCase();
    string2 = string2.toLowerCase();

    const costs = [];

    for (let i = 0; i <= string1.length; i++) {
        let lastValue = i;

        for (let j = 0; j <= string2.length; j++) {
            if (i == 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];

                    if (string1.charAt(i - 1) != string2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }

                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }

        if (i > 0) {
            costs[string2.length] = lastValue;
        }
    }

    return costs[string2.length];
};

/**
 * https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
 */
export const getSimilarity = (string1: string, string2: string) => {
    let longer = string1;
    let shorter = string2;

    if (string1.length < string2.length) {
        longer = string2;
        shorter = string1;
    }

    const longerLength = longer.length;

    if (longerLength === 0) {
        return 100;
    }

    const difference =
        ((longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString())) *
        100;

    return difference === 0 ? 100 : difference.toFixed(2);
};

export const getIp = (req: any) => {
    // @ts-ignore
    return (
        (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        // @ts-ignore
        req.connection.socket.remoteAddress
    );
};

export const formatBytesToSize = (bytes: number, seperator: string = '') => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes !== 0) {
        // @ts-ignore
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);

        if (i === 0) {
            return `${bytes}${seperator}${sizes[i]}`;
        } else {
            return `${(bytes / 1024 ** i).toFixed(1)}${seperator}${sizes[i]}`;
        }
    }
};

export const formatImportErrors = (errors, fields) => {
    return Object.keys(errors.value)
        .reduce((acc, key) => {
            const entryError = errors.inner.find(e => e.path === key);

            if (entryError) {
                let formattedError = `<span class="block"><strong class="font-semibold">${humanise(
                    key
                )}</strong>: "${errors.value[key] || ''}"`;

                if (entryError) {
                    const validation = entryError
                        ? fields[key].errors?.[entryError.message] || entryError.message
                        : entryError.message;
                    formattedError = `${formattedError} <span class="text-sm text-red-900 offset-2">&mdash; ${validation}</span>`;
                }

                formattedError = `${formattedError}</span>`;

                return [...acc, formattedError];
            } else {
                return acc;
            }
        }, [])
        .filter(i => i)
        .join('');
};

export const documentHasTranslations = (language: string, document) => {
    if (
        language &&
        document?.languages?.length > 1 &&
        document?.languages.includes(language) &&
        document?.translations[language]
    ) {
        return true;
    }
};

export const getRandomId = (length = 20) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};
