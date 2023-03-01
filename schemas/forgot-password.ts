import {object, ObjectSchema, string} from 'yup';

export interface ForgotPasswordForm {
    email: string;
}

const schema: ObjectSchema<ForgotPasswordForm> = object().shape({
    email: string().email('empty').required('empty')
});

const fields = {
    email: {
        errors: {
            empty: 'Please enter a valid email address',
            'auth/invalid-email': 'Please enter a valid email address',
            'auth/user-disabled': 'This account is not active. Please contact an admin.',
            'auth/user-not-found': 'Sorry, this account does not exist.'
        },
        field: 'input',
        label: 'Email address',
        placeholder: 'you@domain.com',
        type: 'email'
    }
};

export default {fields, schema};
