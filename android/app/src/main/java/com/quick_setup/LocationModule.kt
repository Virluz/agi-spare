package com.algyas.agispares

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Looper
import android.provider.Settings
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.google.android.gms.location.*
import com.google.android.gms.common.api.ResolvableApiException
import androidx.core.content.ContextCompat


class LocationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var enableGpsPromise: Promise? = null
    private val REQUEST_ENABLE_GPS = 12345

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName() = "LocationModule"

    @ReactMethod
    fun requestEnableGPS(promise: Promise) {
        val context = reactApplicationContext
        val client = LocationServices.getSettingsClient(context)

        val locationRequest = LocationRequest.create()
            .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY)

        val settingsRequest = LocationSettingsRequest.Builder()
            .addLocationRequest(locationRequest)
            .setAlwaysShow(true)  // Ensures a popup instead of redirection
            .build()

        client.checkLocationSettings(settingsRequest)
            .addOnSuccessListener {
                promise.resolve(true) // GPS already enabled
            }
            .addOnFailureListener { e ->
                if (e is ResolvableApiException) {
                    try {
                        val activity = currentActivity
                            ?: return@addOnFailureListener promise.reject("NO_ACTIVITY", "Activity is null")
                        enableGpsPromise = promise
                        e.startResolutionForResult(activity, REQUEST_ENABLE_GPS)
                    } catch (sendEx: Exception) {
                        promise.reject("ERROR_START", sendEx)
                    }
                } else {
                    promise.reject("NOT_RESOLVABLE", e.message)
                }
            }
    }

    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        if (!hasLocationPermission()) {
            promise.reject("PERMISSION_DENIED", "Location permission not granted.")
            return
        }

        val context = reactApplicationContext
        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

        fusedLocationClient.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) {
                    val locationMap = WritableNativeMap().apply {
                        putDouble("latitude", location.latitude)
                        putDouble("longitude", location.longitude)
                        putDouble("accuracy", location.accuracy.toDouble())  // Convert Float to Double
                        putDouble("altitude", location.altitude.toDouble())  // Convert Float to Double
                        putDouble("speed", location.speed.toDouble())        // Convert Float to Double
                        putDouble("bearing", location.bearing.toDouble())    // Convert Float to Double
                        putString("provider", location.provider)
                        putDouble("timestamp", location.time.toDouble())
                    }
                    promise.resolve(locationMap)
                } else {
                    promise.reject("LOCATION_UNAVAILABLE", "Unable to retrieve current location.")
                }
            }
            .addOnFailureListener { exception ->
                promise.reject("LOCATION_ERROR", "Failed to retrieve location: ${exception.message}")
            }
    }

    @ReactMethod
    fun startLocationService() {
        val context = reactApplicationContext
        val intent = Intent(context, LocationService::class.java)
        ContextCompat.startForegroundService(context, intent)
    }

    @ReactMethod
    fun stopLocationService() {
        val serviceIntent = Intent(reactApplicationContext, LocationService::class.java)
        reactApplicationContext.stopService(serviceIntent)
    }

    @ReactMethod
    fun resendCachedLocations() {
        val serviceIntent = Intent(reactApplicationContext, LocationService::class.java).apply {
            putExtra("command", "resend")
        }
        ContextCompat.startForegroundService(reactApplicationContext, serviceIntent)
    }

     @ReactMethod
    fun addListener(eventName: String) {
        // No-op - events are always emitted
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // No-op - events are always emitted
    }

    private fun hasLocationPermission(): Boolean {
        return ActivityCompat.checkSelfPermission(
            reactApplicationContext,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_ENABLE_GPS) {
            val manager = activity.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val enabled = manager.isProviderEnabled(LocationManager.GPS_PROVIDER)
            enableGpsPromise?.apply {
                if (enabled) resolve(true)
                else reject("GPS_NOT_ENABLED", "GPS remains disabled")
            }
            enableGpsPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // No-op
    }
}
