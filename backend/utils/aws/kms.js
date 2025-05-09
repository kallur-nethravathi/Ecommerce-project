import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// Configure AWS SDK for KMS
const kms = new AWS.KMS({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

class KMSWrapper {
    constructor() {}

    /**
     * Retrieves a secret key from AWS KMS by Key ID
     * @param {string} keyId - The KMS Key ID (public or private)
     * @param {string} secret - Additional parameter (if needed for handling different key types)
     * @returns {Promise<string>} - Decrypted key
     */
    async getSecret(keyId, secret = null) {
        try {
            const decryptedData = await kms.decrypt({
                CiphertextBlob: Buffer.from(keyId, "base64")
            }).promise();

            return decryptedData.Plaintext.toString("utf-8");
        } catch (error) {
            console.error(`Error retrieving key from KMS for ID: ${keyId}`, error);
            throw error;
        }
    }
}

export default new KMSWrapper();
