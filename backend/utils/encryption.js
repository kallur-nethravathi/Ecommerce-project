import EncryptionCurve25519 from "./encryprionCurve25519.js";
import SignatureService from "./signatureService.js";
import { messageDigitalSignatureModel } from "../models/messageDigitalSignatureKeys.js";
import { messageEncryptionKeysModel } from "../models/messageEncryptionkeys.js";
import kms from "./aws/kms.js";
import DatabaseService from "../services/db.service.js";
let encryptionService, signatureService;
let dbService;
export async function initializeEncryptionServices() {
  try {
    dbService=new DatabaseService();
    if (!encryptionService && !signatureService) {
      let keys=await getKeys();
      if(!keys) return null;
     encryptionService = new EncryptionCurve25519(keys.ENCRYPTION_PUBLIC_KEY, keys.ENCRYPTION_PRIVATE_KEY);
     signatureService = new SignatureService(keys.DIGITAL_SIGNATURE_PRIVATE_KEY, keys.DIGITAL_SIGNATURE_PUBLIC_KEY);
    }
    console.log("creating encry services")
    
    // dbService=;
    console.log("Encryption services initialized successfully.",);
  } catch (error) {
    console.error('Error initializing services:', error);
    // throw error;
  }
}


async function getKeys() {
  try {
    // Fetch both signature and encryption key details in parallel
    const [signatureKeyDetails, encryptionKeyDetails] = await Promise.all([
      dbService.findOne(messageDigitalSignatureModel, { is_active: "enabled" }, { created_datetime: -1 }),
      dbService.findOne(messageEncryptionKeysModel, { is_active: "enabled" }, { created_datetime: -1 })
    ]);

    // If any key details are missing, return null
    if (!signatureKeyDetails || !encryptionKeyDetails) return null;

    // Helper function to fetch keys dynamically
    const fetchKey = async (details, envPrivate, envPublic) => {
      if (details.key_storage_location_options === "application_server") {
        return {
          privateKey: process.env[envPrivate],
          publicKey: process.env[envPublic]
        };
      } else if (details.key_storage_location_options === "third_party_hosted_managed_key_vault") {
        return {
          privateKey: await kms.getSecret(details.private_key_rel_kms_provided_ref, details.private_key),
          publicKey: await kms.getSecret(details.public_key_rel_kms_provided_ref, details.public_key)
        };
      }
      return {};
    };

    process.env.KEY_VERSION=encryptionKeyDetails.key_version;
    process.env.KEY_LABEL=encryptionKeyDetails.key_label;
    // Fetch signature keys and encryption keys in parallel
    const [signatureKeys, encryptionKeys] = await Promise.all([
      fetchKey(signatureKeyDetails, "DIGITAL_SIGNATURE_PRIVATE_KEY", "DIGITAL_SIGNATURE_PUBLIC_KEY"),
      fetchKey(encryptionKeyDetails, "ENCRYPTION_PRIVATE_KEY", "ENCRYPTION_PUBLIC_KEY")
    ]);

    return {
      DIGITAL_SIGNATURE_PRIVATE_KEY: signatureKeys.privateKey,
      DIGITAL_SIGNATURE_PUBLIC_KEY: signatureKeys.publicKey,
      ENCRYPTION_PRIVATE_KEY: encryptionKeys.privateKey,
      ENCRYPTION_PUBLIC_KEY: encryptionKeys.publicKey
    };
    
  } catch (error) {
     console.error("Error in getKeys:", error);
    return null
    ;
  }
}


export function encrypt(data) {
  return encryptionService.encrypt(data);

}
export function decrypt(data) {
  return encryptionService.decrypt(data);
}
export function sign(data) {
  return signatureService.signData(data);
}
export function verify(data, signature) {
  return signatureService.verifyData(data, signature);
}

export function encryptField(value,biRequired=false) {
    if(value==undefined && value==null && value == "") return null;
    let encryptedData=encrypt(value);
    return {
        data: encryptedData,
        signature:sign(encryptedData),
        ...((biRequired)?{bi:sign(value)}:null)
    }
}
export function decryptField(value, signature) {
    if(value==undefined && value==null && value == "") return null;
    if(verify(value, signature)) {
        return decrypt(value);
    }else{
      return null;
    }
   
}
// let encryptedData=encryptField("tesgt",true);
// console.log(encryptedData);
// let decryptedData=decryptField(encryptedData.data,encryptedData.signature);
// console.log(decryptedData);


