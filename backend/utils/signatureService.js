import nacl from 'tweetnacl';
import pkg from 'tweetnacl-util';
const { encodeBase64, decodeBase64 } = pkg;

class SignatureService {
  constructor(privateKey, publicKey) {
  this.privateKey = decodeBase64(privateKey); 
  this.publicKey = decodeBase64(publicKey); 
  }

  signData(data) {
    const encodedData = new TextEncoder().encode(data);
    const signature = nacl.sign.detached(encodedData, this.privateKey);
    return encodeBase64(signature);
  }

  verifyData(data, signature) {
    const encodedData = new TextEncoder().encode(data);
    const decodedSignature = decodeBase64(signature);
    return nacl.sign.detached.verify(encodedData, decodedSignature, this.publicKey);
  }
}

export default SignatureService;