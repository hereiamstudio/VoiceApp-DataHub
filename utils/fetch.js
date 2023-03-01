import fetch from 'isomorphic-unfetch';
import merge from 'lodash/merge';

export const fetchOptions = (options = {}, locale = 'en') => {
    let defaultOptions = {
        method: options.body ? 'post' : 'get',
        headers: {
            Accept: 'application/json',
            'Accept-Language': locale,
            'Content-Type': 'application/json'
        }
    };

    if (options.body) {
        options.body = JSON.stringify(options.body);
    }

    return merge(defaultOptions, options);
};

const fetchWrapper = async (...args) => {
    try {
        const response = await fetch(...args);
        const data = await response.json();

        if (response.ok) {
            return data;
        }

        let error = new Error(response.statusText);

        error.response = response;
        error.data = data;

        throw error;
    } catch (error) {
        if (!error.data) {
            error.data = error.message;
        }

        throw error;
    }
};

export default fetchWrapper;
