//
//  LocationModule.m
//  quick_setup
//
//  Created by AOT Mini on 11/07/25.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(LocationModule, RCTEventEmitter)

RCT_EXTERN_METHOD(startLocationService)
RCT_EXTERN_METHOD(stopLocationService)
RCT_EXTERN_METHOD(resendCachedLocations)

@end
