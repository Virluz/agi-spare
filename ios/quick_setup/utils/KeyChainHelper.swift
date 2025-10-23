//
//  Keystore.swift
/

import Foundation


final class KeychainHelper {

    static let standard = KeychainHelper()
    private init() {}
    
    
    func save(_ data: Data, service: String) {
        // Create query
        let query = [
            kSecValueData: data,
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: service,
            kSecAttrAccount: kcAccount,
            kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ] as CFDictionary

        // Add data in query to keychain
        let status = SecItemAdd(query, nil)
        let attributesToUpdate = [kSecValueData: data] as CFDictionary
        // Update existing item
        SecItemUpdate(query, attributesToUpdate)

        if status != errSecSuccess {
            // Print out the error
            // submitLogs(logMessage: "Error: --KeyChain--\(status)", screenName: "Keychain-ListNotification")
            //print("Error: --KeyChain--\(status)")
        }
    }

    func read(service: String) -> Data? {

        let query = [
            kSecAttrService: service,
            kSecAttrAccount: kcAccount,
            kSecClass: kSecClassGenericPassword,
            kSecReturnData: true,
            kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            ] as CFDictionary

        var result: AnyObject?
        SecItemCopyMatching(query, &result)

        return (result as? Data)
    }


    func delete(service: String) {

        let query = [
            kSecAttrService: service,
            kSecAttrAccount: kcAccount,
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ] as CFDictionary

        // Delete item from keychain
        SecItemDelete(query)
    }

}
