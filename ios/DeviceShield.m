//
//  DeviceShield.m
//  quick_setup
//
//  Created by AOT Mini on 08/07/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DeviceShield, NSObject)


RCT_EXTERN_METHOD(decrypt:(NSString *)encryptedMessage
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(encrypt:(NSString *)message
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)



@end
