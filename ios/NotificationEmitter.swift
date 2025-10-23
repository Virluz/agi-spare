//
//  NotificationEmitter.swift
//  quick_setup
//
//  Created by AOT Mini on 21/07/25.
//

// NotificationEmitter.swift
import Foundation
import React

@objc(NotificationEmitter)
class NotificationEmitter: RCTEventEmitter {
  private static var sharedInstance: NotificationEmitter?

  // Buffers for events that occur before listeners are ready
  private var pendingNotification: [AnyHashable: Any]?
  private var pendingToken: String?

  override init() {
    super.init()
    NotificationEmitter.sharedInstance = self
  }

  override func supportedEvents() -> [String]! {
    return ["onNotificationTap", "onTokenReceived", "onNotificationDelivered"]
  }

  // MARK: - Notification Tap Event
  @objc func sendNotificationEvent(_ userInfo: [AnyHashable: Any]) {

    sendEvent(withName: "onNotificationTap", body: userInfo)

  }

  // MARK: - Token Event
  @objc func sendTokenEvent(_ token: String) {

    sendEvent(withName: "onTokenReceived", body: token)

  }

  @objc func sendNotificationDeliveredEvent(_ userInfo: [AnyHashable: Any]) {

    sendEvent(withName: "onNotificationDelivered", body: userInfo)

  }

  override func startObserving() {
    super.startObserving()

    // Send any pending events now that listeners are available
    if let notification = pendingNotification {
      sendEvent(withName: "onNotificationTap", body: notification)
      pendingNotification = nil
    }

    if let token = pendingToken {
      sendEvent(withName: "onTokenReceived", body: token)
      pendingToken = nil
    }

    if let notification = pendingNotification {
      sendEvent(withName: "onNotificationDelivered", body: notification)
      pendingNotification = nil
    }
  }

  // MARK: - Static Methods for AppDelegate
  @objc static func handleNotificationTap(_ userInfo: [AnyHashable: Any]) {
    sharedInstance?.sendNotificationEvent(userInfo)
  }

  @objc static func handleTokenReceived(_ token: String) {
    sharedInstance?.sendTokenEvent(token)
  }

  @objc static func handleNotificationDelivered(_ userInfo: [AnyHashable: Any]) {
    sharedInstance?.sendNotificationDeliveredEvent(userInfo)
  }

  // Required override to prevent warning
  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
