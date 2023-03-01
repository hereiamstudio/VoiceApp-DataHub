require('firebase/firestore');
const firebase = require('firebase/app');
const fs = require('fs');
const omit = require('lodash/omit');
const firestoreSeed = require('../seed/firestore.json');

const Timestamp = firebase.firestore.Timestamp;

const getFixture = name => {
    const fixture = fs.readFileSync(`./cypress/fixtures/${name}.json`, 'utf8');
    const data = JSON.parse(fixture);

    return data || {};
};

const saveFixture = (name, documents) => {
    try {
        const fixture = getFixture(name);
        const data = {...fixture, seed: documents};

        fs.writeFileSync(`./cypress/fixtures/${name}.json`, JSON.stringify(data), 'utf8');
        console.log('Saved fixture:', name);
    } catch (error) {
        console.error(error);
    }
};

const getFormattedDocument = document => {
    const documentFieldKeys = Object.keys(document);
    const formattedDocument = documentFieldKeys.reduce((acc, key) => {
        let value = document[key];

        if (typeof value === 'object') {
            // Timestamp fields need to be converted back from Firebase format
            if (value?.__datatype__ === 'timestamp') {
                const timestamp = new Timestamp(value.value._seconds, value.value._nanoseconds);
                value = new Date(timestamp.toDate());
            }
        }

        return {...acc, ...{[key]: value}};
    }, {});

    return formattedDocument;
};

// Get the formatted documents for each collection
const getCollection = (collectionKey, collection) => {
    const collectionDocuments = Object.keys(collection).reduce((acc, documentKey) => {
        const document = collection[documentKey];
        let documents = {
            [`${collectionKey}/${documentKey}`]: getFormattedDocument(
                omit(document, ['__collections__'])
            )
        };

        // If the document has nested collections, add them to the documents object
        if (document.__collections__) {
            const nestedDocuments = Object.keys(document.__collections__).reduce(
                (acc2, nestedCollectionKey) => {
                    const nestedDoc = document.__collections__[nestedCollectionKey];
                    const nestedDocuments = getCollection(
                        `${collectionKey}/${documentKey}/${nestedCollectionKey}`,
                        nestedDoc
                    );
                    return {...acc2, ...nestedDocuments};
                },
                {}
            );
            documents = {
                ...documents,
                ...nestedDocuments
            };
        }

        return {...acc, ...documents};
    }, {});

    return collectionDocuments;
};

const getAllCollections = (collectionKeys, data) => {
    // Filter all seed data to only include the required collections
    const filteredCollections = Object.keys(data).filter(collectionKey =>
        collectionKeys.includes(collectionKey)
    );
    const filteredDocuments = filteredCollections.map(collectionKey => {
        return getCollection(collectionKey, data[collectionKey]);
    });
    const combinedDocuments = filteredDocuments.reduce(
        (acc, collection) => ({...acc, ...collection}),
        {}
    );

    return combinedDocuments;
};

const init = () => {
    Object.keys(firestoreSeed.__collections__).map(collectionKey => {
        const documents = getAllCollections([collectionKey], firestoreSeed.__collections__);
        saveFixture(collectionKey, documents);
    });
};

init();
