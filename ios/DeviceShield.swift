import Foundation
import RNCryptor
import CryptoKit

let keyData = KeychainHelper.standard.read(service: "SECRET")!
let keyBase64 = String(data: keyData, encoding: .utf8)!
let ivData = KeychainHelper.standard.read(service: "CIV")!
let ivBase64 = String(data: ivData, encoding: .utf8)!


@objc(DeviceShield)
class DeviceShield: NSObject {
  
  // Hardcoded key (replace with your actual key)


  
  
  // Encryption method
  @objc(encrypt:resolver:rejecter:)
 func encrypt(_ plainText: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {

   do {
      let keyData = Data(base64Encoded: keyBase64)!
      let ivData  = Data(base64Encoded: ivBase64)!
      let key     = SymmetricKey(data: keyData)
      let nonce   = try AES.GCM.Nonce(data: ivData)

      let sealed = try AES.GCM.seal(plainText.data(using: .utf8)!, using: key, nonce: nonce)
      // `.combined` gives ciphertext + tag
      let combined = sealed.ciphertext + sealed.tag

      resolve(combined.base64EncodedString())
    } catch {
      reject("E_ENCRYPT", error.localizedDescription, error)
    }
  }
  
  // Decryption method
  @objc(decrypt:resolver:rejecter:)
  func decrypt(_ cipherText: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    do {
      let keyData = Data(base64Encoded: keyBase64)!
      let ivData  = Data(base64Encoded: ivBase64)!
      let key     = SymmetricKey(data: keyData)
      let nonce   = try AES.GCM.Nonce(data: ivData)

      let combined = Data(base64Encoded: cipherText)!
      let tagLen = 16
      let ciphertext = combined.prefix(combined.count - tagLen)
      let tag = combined.suffix(tagLen)

      let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
      let decrypted = try AES.GCM.open(sealedBox, using: key)
      resolve(String(data: decrypted, encoding: .utf8))
    } catch {
      reject("E_DECRYPT", error.localizedDescription, error)
    }
  }

  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  
}
