To further secure the data collected during an interview, we encrypt the data before it is transferred over the network and saved in the database. This ensures that, in the unlikely event that the SSL encryption used for HTTP requests is compromised, the interview data can never be viewed once it has been posted by the app.

## **Encryption**

We use a combination of AES-256 block cipher and RSA public/private keys (also with AES-256) for encryption. The AES-256 encryption algorithm  is accepted to be impenetrable.

To encrypt the interview data object, we first convert the object to a string. We use a unique, random 16 byte Initialisation Vector (IV) and 32 byte secret for every interview response and these are then used to encrypt the interview data string using the AES-256-CBC algorithm.

After the interview data is encrypted, we then use our RSA public key to encrypt the IV and secret that we generated for this interview. We additionally use PKCS1 padding when encrypting with the public key.

Once encrypted, the data is then posted to a “queue” in the Firebase database.

_Encryption happens on the Android app and to interview data only. The public key is stored in the app and the app does not have access to the private key required for decryption._

### Interview response

The following is a list of the fields posted in an encrypted interview.

-   **ID**: ID (randomly generated) for the document in the database
-   **Encrypytion version**: Identify if our encryption functionality is used, and if so, which version
-   **Enumerator ID**: ID of the enumerator conducting the interview (based on app login), used to ensure enumerator has access to save data against the project and interview
-   **Data**: The cipher-encrypted interview response
-   **IV**: The public key-encrypted IV used to encrypt the interview response
-   **Secret** The public key-encrypted secret used to encrypt the interview response

## **Decryption**

Once interviews are encrypted and saved in the queue in the database, we then trigger a Firebase Cloud Function that will handle decryption of the data.

To decrypt the interview data we first decrypt the IV and secret used in the cipher encryption. The private key and passphrase for doing so are stored with Google Secret Manager and are retrieved using the Google Cloud SDK.

Once the IV and secret is decrypted we can then use the decrypted strings to decrypt the data string too. When this is complete we then save the decrypted interview response and remove the encrypted interview from the queue.

_Access to the private key and passphrase is restricted to Google Cloud account/project admin and also the Firebase service account only. The app has no access to these and they cannot be viewed in the VoiceApp Data Hub. Firebase database data is encrypted at rest._

These flows happen behind the scenes when a user submits an interview. Encryption happens on the app, which then sends the encrypted data to the Firestore database. From there, Firebase Cloud Functions are triggered and decrypt and store the interview data.
