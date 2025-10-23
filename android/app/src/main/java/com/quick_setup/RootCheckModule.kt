package com.app.latest

import android.app.Activity
import android.view.WindowManager
import com.facebook.react.bridge.*
import com.scottyab.rootbeer.RootBeer
import com.facebook.react.bridge.*
import android.util.Base64
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import com.app.latest.BuildConfig;

class RootCheckModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

 private val SECRET_KEY = BuildConfig.SECRET_KEY;
  private val IV =  BuildConfig.IV_SALT;
  private val KEY_ALGO = "AES"
  private val CIPHER_ALGO = "AES/GCM/NoPadding"
  private val TAG_LEN = 128

    override fun getName(): String {
        return "DeviceShield" 
    }

    @ReactMethod
    fun isRooted(promise: Promise) {
        val rootBeer = RootBeer(reactApplicationContext)
        promise.resolve(rootBeer.isRooted)
    }

  @ReactMethod
    fun encrypt(plainText: String, promise: Promise) {
    try {
      val keyBytes = Base64.decode(SECRET_KEY, Base64.NO_WRAP)
      val ivBytes = Base64.decode(IV, Base64.NO_WRAP)
      val secretKey: SecretKey = SecretKeySpec(keyBytes, KEY_ALGO)
      val cipher = Cipher.getInstance(CIPHER_ALGO)
      val spec = GCMParameterSpec(TAG_LEN, ivBytes)
      cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec)
      val enc = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
      promise.resolve(Base64.encodeToString(enc, Base64.NO_WRAP))
    } catch (e: Exception) {
      promise.reject("E_ENCRYPT", e)
    }
  }

  @ReactMethod
  fun decrypt(cipherText: String, promise: Promise) {
    try {
      val keyBytes = Base64.decode(SECRET_KEY, Base64.NO_WRAP)
      val ivBytes = Base64.decode(IV, Base64.NO_WRAP)
      val secretKey: SecretKey = SecretKeySpec(keyBytes, KEY_ALGO)
      val cipher = Cipher.getInstance(CIPHER_ALGO)
      val spec = GCMParameterSpec(TAG_LEN, ivBytes)
      cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
      val decoded = Base64.decode(cipherText, Base64.NO_WRAP)
      val plain = cipher.doFinal(decoded)
      promise.resolve(String(plain, Charsets.UTF_8))
    } catch (e: Exception) {
      promise.reject("E_DECRYPT", e)
    }
  }
}
