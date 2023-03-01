import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
import {useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import 'jest-fetch-mock';
require('jest-fetch-mock').enableMocks();

// @ts-ignore
jest.spyOn(firebase, 'auth').mockImplementation(() => {
    const currentUser = {
        displayName: 'testDisplayName',
        getIdToken: jest.fn(() => Promise.resolve('abc123')),
        email: 'test@test.com',
        email_verified: false,
        uid: 'abc123'
    };

    return {
        sendPasswordResetEmail: jest.fn(uid => Promise.resolve(uid)),
        signOut: jest.fn(() => Promise.resolve(true)),
        currentUser,
        onAuthStateChanged: jest.fn(callback => {
            callback();
            return () => {};
        }),
        sendEmailVerification: jest.fn(() => Promise.resolve('result of sendEmailVerification'))
    };
});

// jest.spyOn(admin, 'firestore').mockImplementation(() => {
//     return {};
// });

jest.mock('../utils/firebase/user', () => {
    const moduleMock = jest.requireActual('../utils/firebase/user');

    return {
        ...moduleMock,
        sendVerificationEmail: jest.fn()
    };
});

// @ts-ignore
setTimeout().__proto__.unref = function () {};
// @ts-ignore
window.globalData = {};
// @ts-ignore
window.localStorage = {};
// @ts-ignore
window.scrollTo = () => {};
// @ts-ignore
window.alert = value => {};
// @ts-ignore
global.requestAnimationFrame = fn => setTimeout(fn, 16);

export const RecoilObserver = ({node, onChange}) => {
    const value = useRecoilValue(node);
    useEffect(() => {
        onChange(value);
        console.log(value);
    }, [onChange, value]);
    return null;
};
