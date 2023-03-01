// @flow
import encrypt from '../../encryption/encrypt';
import decrypt from '../../functions/encryption/decrypt';
import {generateKeyPairSync} from 'crypto';
import faker from '@faker-js/faker';

describe('Encryption', () => {
    const passphrase = faker.internet.password();
    const {privateKey, publicKey} = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase
        }
    });

    const string = faker.lorem.paragraph();
    const jsonString = JSON.stringify({data: string});
    const stringLarge = [...Array(100)].map(_ => faker.lorem.paragraph()).join(' ');
    const jsonStringLarge = JSON.stringify({data: stringLarge});

    test('encrypts content', () => {
        const encryptedData = encrypt(jsonString, publicKey);

        expect(encryptedData.hasOwnProperty('data')).toEqual(true);
        expect(encryptedData.hasOwnProperty('iv')).toEqual(true);
        expect(encryptedData.hasOwnProperty('secret')).toEqual(true);
    });

    test('encrypts large amount of content', () => {
        const encryptedData = encrypt(jsonStringLarge, publicKey);

        expect(encryptedData.hasOwnProperty('data')).toEqual(true);
        expect(encryptedData.hasOwnProperty('iv')).toEqual(true);
        expect(encryptedData.hasOwnProperty('secret')).toEqual(true);
    });

    test('returns empty if the data is empty', () => {
        const encryptedDataEmpty = encrypt('', publicKey);
        const encryptedDataNull = encrypt(null, publicKey);
        const encryptedDataUndefined = encrypt();

        expect(encryptedDataEmpty).toEqual('');
        expect(encryptedDataNull).toEqual(null);
        expect(encryptedDataUndefined).toEqual(undefined);
    });

    test('fails if the public key empty', () => {
        expect(() => encrypt(jsonString, '')).toThrow();
        expect(() => encrypt(jsonString, null)).toThrow();
        expect(() => encrypt(jsonString)).toThrow();
    });

    test('decrypts content that has been encrypted', () => {
        const encryptedData = encrypt(jsonString, publicKey);
        const decryptedData = decrypt(encryptedData, privateKey, passphrase);

        expect(decryptedData).toEqual(jsonString);
    });

    test('decrypts large amount of content that has been encrypted', () => {
        const encryptedData = encrypt(jsonStringLarge, publicKey);
        const decryptedData = decrypt(encryptedData, privateKey, passphrase);

        expect(decryptedData).toEqual(jsonStringLarge);
    });

    test('fails decryption if the string is empty', () => {
        expect(() => decrypt('', privateKey)).toThrow();
        expect(() => decrypt(null, privateKey)).toThrow();
        expect(() => decrypt()).toThrow();
    });

    test('fails if the private key is empty', () => {
        const encryptedData = encrypt(jsonString, publicKey);

        expect(() => decrypt(encryptedData, '')).toThrow();
        expect(() => decrypt(encryptedData, null)).toThrow();
        expect(() => decrypt(encryptedData)).toThrow();
    });

    test('fails if the private key is incorrect', () => {
        const encryptedData = encrypt(jsonString, publicKey);

        expect(() => decrypt(encryptedData, 'somerandomstringthatsnottheprivatekey')).toThrow();
    });
});
