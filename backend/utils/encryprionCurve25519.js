// simpleCurve25519.js
import nacl from 'tweetnacl';

import pkg from 'tweetnacl-util';
const { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } =pkg;

class EncryptionCurve25519 {
    constructor(publicKey = null, privateKey = null) {
        if (publicKey && privateKey) {
            this.keyPair = {
                publicKey: decodeBase64(publicKey),
                secretKey: decodeBase64(privateKey)
            };
        } else {
            this.keyPair = nacl.box.keyPair();
            console.log("private key: ",encodeBase64(this.keyPair.secretKey))
            console.log("public key: ", encodeBase64(this.keyPair.publicKey))
        
        
        }
    }

    getPublicKey() {
        return encodeBase64(this.keyPair.publicKey);
    }

    getPrivateKey() {
        return encodeBase64(this.keyPair.secretKey);
    }

    /**
     * Encrypt data and combine with nonce into single string
     * @param {string} data - Data to encrypt
     * @param {string} recipientPublicKey - Recipient's public key in base64
     * @returns {string} - Combined nonce and encrypted data in base64
     */
    encrypt(data, ) {
        if (!data) return null;

        try {
            const messageUint8 = decodeUTF8(data);
            const nonce = nacl.randomBytes(nacl.box.nonceLength);
            const recipientPublicKeyUint8 = decodeBase64(this.getPublicKey());

            const encrypted = nacl.box(
                messageUint8,
                nonce,
                recipientPublicKeyUint8,
                this.keyPair.secretKey
            );

            // Combine nonce and encrypted data
            const fullMessage = new Uint8Array(nonce.length + encrypted.length);
            fullMessage.set(nonce);
            fullMessage.set(encrypted, nonce.length);

            // Return as single base64 string
            return encodeBase64(fullMessage);
        } catch (error) {
            console.log("at encryptionthis filed: => ",data)
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt data that includes nonce
     * @param {string} encryptedData - Combined nonce and encrypted data in base64
     * @param {string} senderPublicKey - Sender's public key in base64
     * @returns {string} - Decrypted data
     */
    decrypt(encryptedData) {
        if (!encryptedData) return null;

        try {
            // Decode the combined message
            const fullMessage = decodeBase64(encryptedData);
            
            // Split nonce and encrypted data
            const nonce = fullMessage.slice(0, nacl.box.nonceLength);
            const encrypted = fullMessage.slice(nacl.box.nonceLength);
            const senderPublicKeyUint8 = decodeBase64(this.getPublicKey());

            const decrypted = nacl.box.open(
                encrypted,
                nonce,
                senderPublicKeyUint8,
                this.keyPair.secretKey
            );

            if (!decrypted) {
                throw new Error('Decryption failed');
            }

            return encodeUTF8(decrypted);
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
}

export default EncryptionCurve25519;