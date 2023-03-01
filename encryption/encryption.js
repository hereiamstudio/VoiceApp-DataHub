require('dotenv').config();
const crypto = require('crypto');
const constants = require('constants');
const path = require('path');
const fs = require('fs');
const {generateKey, encryptString, decryptString} = require('../functions/encryption');

/**
 * Allows async file reading. This is supported natively in Node 11+,
 * but Firebase only supports Node 10 currently.
 */
const readFileAsync = async path => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
};

/**
 * Further encrypt a private key using our additional secret.
 */
const encryptPrivateKey = (input, password) => {
    const passwordHash = crypto
        .createHash('md5')
        .update(password, 'utf-8')
        .digest('hex')
        .toUpperCase();

    try {
        const data = new Buffer.from(input).toString('binary');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', passwordHash, iv);
        const encrypted = cipher.update(data, 'utf8', 'binary') + cipher.final('binary');
        const encoded =
            new Buffer.from(iv, 'binary').toString('hex') +
            new Buffer.from(encrypted, 'binary').toString('hex');

        return encoded;
    } catch (error) {
        console.error(error);
    }
};

/**
 * Decrypt an encrypted private key using our secret.
 */
const decryptPrivateKey = (encryptPrivateKey, secret) => {
    const combined = new Buffer.from(encryptPrivateKey, 'hex');
    const secretHash = crypto.createHash('md5').update(secret, 'utf-8').digest('hex').toUpperCase();
    const iv = new Buffer.alloc(16);

    combined.copy(iv, 0, 0, 16);

    const edata = combined.slice(16).toString('binary');
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretHash, iv);

    let decrypted, plaintext;

    try {
        plaintext = decipher.update(edata, 'binary', 'utf8') + decipher.final('utf8');
    } catch (ex) {
        plaintext = 'Error decrypting!!!';
        console.error(ex);
    }

    return plaintext;
};

/**
 * Retrieve the private key.
 */
const getPrivateKey = async () => {
    try {
        const privateKey = await readFileAsync('private.pem');

        return privateKey;
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**
 * Retrieve the private key and then encrypt it.
 */
const getAndEncryptPrivateKey = async () => {
    try {
        const privateKey = await getPrivateKey();
        const secret = process.env.ENCRYPTION_SECRET;
        const encryptedPrivateKey = encryptPrivateKey(privateKey, secret);

        return encryptedPrivateKey;
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**
 * Retrieve the encrypted private key.
 */
const getEncryptedPrivateKey = async () => {
    try {
        const encryptedPrivateKey = await readFileAsync('encrypted-private-key.txt');

        return encryptedPrivateKey;
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**
 * Retrieve the encrypted private key and then decrypt it.
 */
const getDecryptedPrivateKey = async () => {
    try {
        const encryptedPrivateKey = await getEncryptedPrivateKey();
        const secret = process.env.ENCRYPTION_SECRET;
        const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey, secret);

        return decryptedPrivateKey;
    } catch (error) {
        console.log(error);
        return error;
    }
};

const testData =
    'This is a test string for encrypting and decrypting using AES-256-CBC and 16-bit IV';

const init = async () => {
    try {
        // const encryptedPrivateKey = await getAndEncryptPrivateKey();
        // console.log(encryptedPrivateKey);

        // const decryptedPrivateKey = await getDecryptedPrivateKey();
        // console.log(decryptedPrivateKey);

        ///////////

        const secret = process.env.ENCRYPTION_SECRET;

        const encryptedContent = await encryptString(testData, secret);
        console.log({encryptedContent});

        const decryptedContent = await decryptString(encryptedContent, secret);
        console.log({decryptedContent});
    } catch (error) {
        console.log(error);
    }
};

init();
