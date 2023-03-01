require('dotenv').config();
const {generateKeyPairSync} = require('crypto');
const {promises, writeFileSync} = require('fs');

const doKeysExist = async () => {
    try {
        await promises.access('private.pem');
        await promises.access('public.pem');

        return true;
    } catch (error) {
        return false;
    }
};

const generateKeys = async () => {
    try {
        const keysExist = await doKeysExist();

        if (keysExist) {
            throw new Error(keysExist === true ? 'Cannot override existing keys' : keysExist);
        }

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
                passphrase: process.env.passphrase
            }
        });

        writeFileSync('private.pem', privateKey);
        writeFileSync('public.pem', publicKey);
    } catch (error) {
        console.log(error);
    }
};

generateKeys();
