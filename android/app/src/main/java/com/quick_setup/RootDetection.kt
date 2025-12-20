package com.algyas.agispares

import android.content.Context
import android.os.Build
import com.scottyab.rootbeer.RootBeer
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader

object RootDetection {

    fun isRooted(cont: Context): Boolean {
        val rootBeer = RootBeer(cont)
        return rootBeer.isRooted || isDeviceRooted()
    }

    private fun isDeviceRooted(): Boolean {
        return checkRootMethod1() ||
               checkRootMethod2() ||
               checkRootMethod3() ||
               checkBuildConfig() ||
               checkByProcess()
    }

    private fun checkRootMethod1(): Boolean {
        val buildTags = Build.TAGS
        return !buildTags.isNullOrBlank() && buildTags.contains("test-keys")
    }

    private fun checkRootMethod2(): Boolean {
        val paths = listOf(
            "/system/app/Superuser.apk",
            "/system/etc/init.d/99SuperSUDaemon",
            "/dev/com.koushikdutta.superuser.daemon/",
            "/system/xbin/daemonsu",
            "/sbin/su",
            "/system/bin/su",
            "/system/bin/failsafe/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/data/local/su",
            "/system/sd/xbin/su",
            "system/xbin/busybox",
            "com.thirdparty.superuser",
            "eu.chainfire.supersu",
            "com.noshufou.android.su",
            "com.koushikdutta.superuser",
            "com.zachspong.temprootremovejb",
            "com.ramdroid.appquarantine",
            "com.topjohnwu.magisk"
        )
        return paths.any { File(it).exists() }
    }

    private fun checkRootMethod3(): Boolean {
        val commands = arrayOf(
            arrayOf("/system/xbin/which", "su"),
            arrayOf("/system/bin/which", "su")
        )
        return commands.any { cmd ->
            try {
                val process = Runtime.getRuntime().exec(cmd)
                BufferedReader(InputStreamReader(process.inputStream)).use { reader ->
                    reader.readLine()?.let { return true }
                }
                process.destroy()
                false
            } catch (t: Throwable) {
                false
            }
        }
    }

    private fun checkBuildConfig(): Boolean {
       if (Build.MANUFACTURER.contains("Genymotion", true)
        || Build.MODEL.contains("google_sdk", true)
        || Build.MODEL.contains("sdk_gphone", true)
        || Build.MODEL.contains("Emulator", true)
        || Build.MODEL.contains("Android SDK built for x86", true)
        || Build.MODEL.lowercase().contains("droid4x")
        || Build.HARDWARE.equals("goldfish", true)
        || Build.HARDWARE.equals("vbox86", true)
        || Build.HARDWARE.lowercase().contains("nox")
        || Build.FINGERPRINT.startsWith("generic")
        || Build.PRODUCT in listOf("sdk", "google_sdk", "sdk_x86", "vbox86p")
        || Build.PRODUCT.lowercase().contains("nox")
        || Build.BOARD.lowercase().contains("nox")
        || (Build.BRAND.startsWith("generic", true)
            && Build.DEVICE.startsWith("generic", true))
    ) return true

    return false
    }

    private fun checkByProcess(): Boolean {
        var isRooted = false
        val pid = android.os.Process.myPid()

        try {
            val process = Runtime.getRuntime().exec("cat /proc/$pid/maps")
            BufferedReader(InputStreamReader(process.inputStream)).use { reader ->
                val content = reader.readText()
                if (content.contains("frida-gadget")
                    || content.contains("frida-server")
                    || content.contains("frida-agent")
                ) {
                    isRooted = true
                }
            }
            process.waitFor()
        } catch (_: Exception) {
        }

        return isRooted
    }
}
