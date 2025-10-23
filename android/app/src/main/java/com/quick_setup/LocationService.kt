// LocationService.kt
package com.app.latest

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.location.Location
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactInstanceManager.ReactInstanceEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.location.*
import org.json.JSONArray
import org.json.JSONObject

class LocationService : Service() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var locationRequest: LocationRequest
    private val TAG = "LocationService"
    private val LOCATION_KEY = "cached_locations"
    private val MAX_CACHE_SIZE = 100

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate called")
        sharedPreferences = getSharedPreferences("LocationServicePrefs", Context.MODE_PRIVATE)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        startForeground(1, createNotification())

        setupLocationUpdates()
    }

    private fun setupLocationUpdates() {
        locationRequest =
                LocationRequest.create().apply {
                    interval = 10000
                    fastestInterval = 10000
                    priority = LocationRequest.PRIORITY_HIGH_ACCURACY
                    smallestDisplacement = 0f
                }

        locationCallback =
                object : LocationCallback() {
                    override fun onLocationResult(result: LocationResult) {
                        // Fixed: Proper null handling for locations
                        val lastLocation = result.lastLocation
                        if (lastLocation != null) {
                            Log.d(TAG, "Location received: $lastLocation")
                            handleNewLocation(lastLocation)
                        } else if (result.locations.isNotEmpty()) {
                            // Fallback to last location in list
                            Log.d(TAG, "Location received (fallback): ${result.locations.last()}")
                            handleNewLocation(result.locations.last())
                        } else {
                            Log.w(TAG, "Empty location result received")
                        }
                    }

                    override fun onLocationAvailability(availability: LocationAvailability) {
                        if (!availability.isLocationAvailable) {
                            Log.w(TAG, "Location services temporarily unavailable")
                        }
                    }
                }

        try {
            fusedLocationClient.requestLocationUpdates(
                    locationRequest,
                    locationCallback,
                    Looper.getMainLooper()
            )
            Log.d(TAG, "Location updates requested successfully")
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permission denied", e)
            stopSelf()
        } catch (e: Exception) {
            Log.e(TAG, "Location request failed", e)
            stopSelf()
        }
    }

    private fun handleNewLocation(location: Location) {
        if (trySendLocation(location)) {
            Log.d(TAG, "Location sent to React Native")
        } else {
            cacheLocation(location)
            Log.d(TAG, "Location cached (React context unavailable)")
        }
    }

    private fun trySendLocation(location: Location): Boolean {
        val application = application as? ReactApplication ?: return false
        val reactInstanceManager: ReactInstanceManager =
                application.reactNativeHost.reactInstanceManager
        val reactContext = reactInstanceManager.currentReactContext

        return if (reactContext != null && reactContext.hasActiveReactInstance()) {
            sendLocation(reactContext, location)
            true
        } else {

            reactInstanceManager.addReactInstanceEventListener(
                    object : ReactInstanceManager.ReactInstanceEventListener {
                        override fun onReactContextInitialized(ctx: ReactContext) {
                            sendLocation(ctx, location)
                            reactInstanceManager.removeReactInstanceEventListener(this)
                        }
                    }
            )
            if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
                reactInstanceManager.createReactContextInBackground()
            }
            false
        }
    }

    private fun sendLocation(context: ReactContext, location: Location) {
        try {
            Log.e(TAG, "sendLocation: ReactContext instance = ${context.toString()}")
            val params =
                    Arguments.createMap().apply {
                        putDouble("latitude", location.latitude)
                        putDouble("longitude", location.longitude)
                        putDouble("accuracy", location.accuracy.toDouble())
                        putDouble("timestamp", location.time.toDouble())
                    }

            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onLocationUpdateNative", params)

            Log.e(TAG, "send location to JS")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send location to JS", e)
            cacheLocation(location)
        }
    }

    private fun cacheLocation(location: Location) {
        val cachedJson = sharedPreferences.getString(LOCATION_KEY, "[]") ?: "[]"
        val jsonArray = JSONArray(cachedJson)

        while (jsonArray.length() >= MAX_CACHE_SIZE) {
            jsonArray.remove(0)
        }

        val jsonObject =
                JSONObject().apply {
                    put("latitude", location.latitude)
                    put("longitude", location.longitude)
                    put("accuracy", location.accuracy)
                    put("timestamp", location.time)
                }
        jsonArray.put(jsonObject)

        sharedPreferences.edit().putString(LOCATION_KEY, jsonArray.toString()).apply()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.let {
            if (it.hasExtra("command")) {
                when (it.getStringExtra("command")) {
                    "resend" -> resendCachedLocations()
                }
            }
        }
        return START_STICKY
    }

    private fun resendCachedLocations() {
        val cachedJson = sharedPreferences.getString(LOCATION_KEY, "[]") ?: "[]"
        val jsonArray = JSONArray(cachedJson)
        if (jsonArray.length() == 0) return

        val application = application as? ReactApplication ?: return
        val reactContext =
                application.reactNativeHost.reactInstanceManager.currentReactContext ?: return

        if (!reactContext.hasActiveReactInstance()) return

        for (i in 0 until jsonArray.length()) {
            try {
                val item = jsonArray.getJSONObject(i)
                val location =
                        Location("cached").apply {
                            latitude = item.getDouble("latitude")
                            longitude = item.getDouble("longitude")
                            accuracy = item.getInt("accuracy").toFloat()
                            time = item.getLong("timestamp")
                        }
                sendLocation(reactContext, location)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to resend cached location", e)
            }
        }

        sharedPreferences.edit().remove(LOCATION_KEY).apply()
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            fusedLocationClient.removeLocationUpdates(locationCallback)
            Log.d(TAG, "Location updates stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping location updates", e)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotification(): Notification {
        val channelId = getString(R.string.default_notification_channel_id)
        val channel =
                NotificationChannel(
                                channelId,
                                "Location Updates",
                                NotificationManager.IMPORTANCE_LOW
                        )
                        .apply { description = "Running location service in background" }

        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)

        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent =
                PendingIntent.getActivity(
                        this,
                        0,
                        launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

        return NotificationCompat.Builder(this, channelId)
                .setContentTitle("Location Tracker Active")
                .setContentText("Getting location updates")
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .build()
    }
}
