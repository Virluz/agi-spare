package com.algyas.agispares

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AlertDialog
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.ReactContext

class MainActivity : ReactActivity() {
    private var notificationData: Bundle? = null
    private var isRNReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme)
        super.onCreate(null)
        
        // Enable FLAG_SECURE to block screenshots and screen recording
        // window.setFlags(
        //         WindowManager.LayoutParams.FLAG_SECURE,
        //         WindowManager.LayoutParams.FLAG_SECURE
        // )

        // if (RootDetection.isRooted(this)) {
        //     showRootedDialog()
        // }
    }

    private fun showRootedDialog() {
        AlertDialog.Builder(this)
                .setTitle("Security Alert")
                .setMessage("This device appears to be rooted. The app will now close.")
                .setCancelable(false)
                .setPositiveButton("Exit") { _, _ ->
                    finishAffinity() // uncomment before creating build
                }
                .create()
                .show()
    }

    /** Returns the name of the main component registered from JavaScript. */
    override fun getMainComponentName(): String = "quick_setup"

    /** Returns the instance of the [ReactActivityDelegate]. */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
            DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
