const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const decrypt = require('./encryption/decrypt');

if (!admin.apps.length) {
    admin.initializeApp();
}

/*
 * We are running this code in the Cloud Functions environment so we don't
 * have to provide any configuration, it's detected automatically from the
 * environment it runs in.
 */
const firestore = admin.firestore();
const secretManagerClient = new SecretManagerServiceClient();

const getSecret = async name => {
    try {
        const [version] = await secretManagerClient.accessSecretVersion({name});

        if (version.payload) {
            return version.payload.data.toString('utf8');
        }
    } catch (error) {
        return error;
    }
};

const getDecryptedData = async data => {
    /**
     * If the data has been sent encrypted we need the secret to be able to decrypt the data.
     */
    if (data.encryption_version) {
        try {
            const config = functions.config().encryption;
            const passphrase = await getSecret(config.key_passphrase_resource_id);
            const privateKey = await getSecret(config.private_key_resource_id);

            /**
             * If the passphrase or private key is not found, we can't decrypt the data. Bail.
             */
            if (!passphrase) {
                throw new Error('passphrase not found');
            } else if (!privateKey) {
                throw new Error('private key not found');
            } else {
                const decryptedData = decrypt(data, privateKey, passphrase);

                if (decryptedData) {
                    return JSON.parse(decryptedData);
                } else {
                    throw new Error('unable to decrypt data');
                }
            }
        } catch (error) {
            return error;
        }
    } else {
        return data;
    }
};
