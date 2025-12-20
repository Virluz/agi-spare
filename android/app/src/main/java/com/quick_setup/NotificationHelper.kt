package com.algyas.agispares

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

class NotificationHelper(private val context: Context) {
    private val channelId = context.getString(R.string.default_notification_channel_id)

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Local Notifications"
            val description = "Channel for local push notifications"
            val importance = NotificationManager.IMPORTANCE_DEFAULT

            NotificationChannel(channelId, name, importance).apply {
                this.description = description
                context.getSystemService(NotificationManager::class.java)
                        ?.createNotificationChannel(this)
            }
        }
    }

    fun showNotification(title: String, message: String) {
        val intent =
                context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
                    flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
                        putExtra("fromNotification", true)
                        putExtra("notificationTitle", title)
                        putExtra("notificationMessage", message)
                }

        val pendingIntent =
                PendingIntent.getActivity(
                        context,
                        0,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

        val notification =
                NotificationCompat.Builder(context, channelId)
                        .setSmallIcon(context.applicationInfo.icon)
                        .setContentTitle(title)
                        .setContentText(message)
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                        .setContentIntent(pendingIntent)
                        .setAutoCancel(true)
                        .build()

        context.getSystemService(NotificationManager::class.java)?.notify(1, notification)
    }
}
