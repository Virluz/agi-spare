//
//  NotificationEmitter.m
//  quick_setup
//
//  Created by AOT Mini on 21/07/25.
//

// #import <React/RCTBridgeModule.h>
// #import <React/RCTEventEmitter.h>

// @interface RCT_EXTERN_MODULE(NotificationEmitter, RCTEventEmitter)
// RCT_EXTERN_METHOD(sendNotificationTapped:(NSDictionary *)userInfo)
// @end

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>


@interface RCT_EXTERN_MODULE(NotificationEmitter, RCTEventEmitter)

RCT_EXTERN_METHOD(supportedEvents)

@end
