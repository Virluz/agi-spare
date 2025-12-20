package com.algyas.agispares

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.util.Log
import com.facebook.react.module.annotations.ReactModule

@ReactModule("NotificationModule")
class NotificationModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    private val notificationHelper = NotificationHelper(reactContext)

    override fun getName() = "NotificationModule"

    @ReactMethod
    fun showLocalNotification(title: String, message: String) {
        notificationHelper.showNotification(title, message)
    }

    // Keep these for compatibility with NativeEventEmitter
    @ReactMethod
    fun addListener(eventName: String) {
        // No-op - events are always emitted
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // No-op - events are always emitted
    }

     @ReactMethod
    fun triggerTestEvent() {
        val params = Arguments.createMap().apply {
            putString("message", "Hello from Kotlin!")
        }
        sendEvent("TEST_EVENT", params)
    }

    private fun sendEvent(event: String, params: WritableMap?) {
        Log.d("NotificationModule", "sendEvent: $event - $params")
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(event, params)
        } catch (e: Exception) {
            Log.e("NotificationModule", "Error sending event: ${e.message}")
        }
    }

    fun notifyClick(title: String, message: String) {
        Log.d("NotificationModule", "Handling notification click: $title - $message")
       reactApplicationContext.runOnJSQueueThread {
        Log.d("NotificationModule", "Emitting event to JS")
        val map = Arguments.createMap().apply {
            putString("title", title)
            putString("message", message)
        }
        sendEvent("NOTIFICATION_CLICKED", map)
    }
    }
}