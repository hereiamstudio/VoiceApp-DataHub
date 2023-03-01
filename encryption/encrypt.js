const crypto = require('crypto');

/**
 * Code references:
 * https://github.com/microsoft/botbuilder-js/blob/master/libraries/botframework-config/src/encrypt.ts
 * https://stackoverflow.com/questions/8750780/encrypting-data-with-public-key-in-node-js
 */

/**
 * Encrypt data using a public key.
 */
const encryptWithPublicKey = (value, publicKey) => {
    const buffer = Buffer.from(value, 'utf8');
    const encrypted = crypto.publicEncrypt(
        {key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING},
        buffer
    );

    return encrypted.toString('base64');
};

/**
 * Encrypt data using public key.
 */
const encrypt = (plainText, publicKey) => {
    if (!plainText || plainText.length === 0) {
        return plainText;
    }

    /**
     * Generates a passphrase/key of 32 byte cryptographically strong pseudo-random
     * data as a base64 encoded string.
     *
     * https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
     */
    const secret = crypto.randomBytes(32).toString('base64');
    const secretBytes = Buffer.from(secret, 'base64');

    /**
     * Generates 16 byte cryptographically strong pseudo-random data as IV
     *
     * https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
     */
    const ivBytes = crypto.randomBytes(16);
    const iv = ivBytes.toString('base64');

    /**
     * Encrypt using aes256 iv + key + plainText = encryptedText
     */
    const cipher = crypto.createCipheriv('aes-256-cbc', secretBytes, ivBytes);
    let encryptedValue = cipher.update(plainText, 'utf8', 'base64');

    encryptedValue += cipher.final('base64');

    /**
     * Return the ciphered string, as well as public-key-encrypted secret and IV
     * required to decrypt it.
     */
    if (encryptedValue) {
        return {
            data: encryptedValue,
            iv: encryptWithPublicKey(iv, publicKey),
            secret: encryptWithPublicKey(secret, publicKey)
        };
    }
};

module.exports = encrypt;
