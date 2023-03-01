const crypto = require('crypto');

/**
 * Code references:
 * https://github.com/microsoft/botbuilder-js/blob/master/libraries/botframework-config/src/encrypt.ts
 * https://stackoverflow.com/questions/8750780/encrypting-data-with-public-key-in-node-js
 */

/**
 * Decrypt data using a private key.
 */
const decryptWithPrivateKey = (value, privateKey, passphrase) => {
    const buffer = Buffer.from(value, 'base64');
    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
            passphrase
        },
        buffer
    );

    return decrypted.toString('utf8');
};

const decrypt = (encryptedValue, privateKey, passphrase) => {
    if (!encryptedValue || !encryptedValue.data || !encryptedValue.iv || !encryptedValue.secret) {
        const missing = [];

        if (!encryptedValue) {
            missing.push('value');
        }
        if (!encryptedValue.data) {
            missing.push('data');
        }
        if (!encryptedValue.iv) {
            missing.push('iv');
        }
        if (!encryptedValue.secret) {
            missing.push('secret');
        }

        throw new Error(`The encrypted value format is not valid: ${missing.join(',')}`);
    }

    const iv = decryptWithPrivateKey(encryptedValue.iv, privateKey, passphrase);
    const secret = decryptWithPrivateKey(encryptedValue.secret, privateKey, passphrase);

    if (!iv || !secret) {
        throw new Error('The iv and secret failed decryption');
    }

    const ivBytes = Buffer.from(iv, 'base64');
    const secretBytes = Buffer.from(secret, 'base64');

    if (ivBytes.length !== 16) {
        throw new Error('The encrypted iv format is not valid');
    }

    if (secretBytes.length !== 32) {
        throw new Error('The secret format is not valid');
    }

    /**
     * Decrypt using aes256 iv + key + encryptedText = decryptedText
     */
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretBytes, ivBytes);
    let value = decipher.update(encryptedValue.data, 'base64', 'utf8');

    value += decipher.final('utf8');

    return value;
};

module.exports = decrypt;
