import Firebase
import RNBootSplash
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  private var blurView: UIVisualEffectView?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(screenCaptureChanged),
      name: UIScreen.capturedDidChangeNotification,
      object: nil)

    // Configure Firebase BEFORE starting the React Native bridge
    // so that JS code can safely call Firebase APIs immediately on startup
    FirebaseApp.configure()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "quick_setup",
      in: window,
      launchOptions: launchOptions
    )

    let dataSecret = Data(SECRET.utf8)
    KeychainHelper.standard.delete(service: "SECRET")
    KeychainHelper.standard.save(dataSecret, service: "SECRET")
    let dataIv = Data(CIV.utf8)

    KeychainHelper.standard.delete(service: "CIV")
    KeychainHelper.standard.save(dataIv, service: "CIV")

    for family in UIFont.familyNames.sorted() {
      print("Family: \(family)")
      let names = UIFont.fontNames(forFamilyName: family)
      for fontName in names {
        print("  \(fontName)")
      }
    }

    // if isDeviceJailbroken() || JailbreakChecker.amIJailbroken()
    //   || EmulatorChecker.amIRunInEmulator() || DebuggerChecker.amIDebugged()
    // {

    //   DispatchQueue.main.asyncAfter(deadline: DispatchTime.now()) {
    //     let alert = UIAlertController(
    //       title: "JailBreak Detected",
    //       message: "JailBroken devices are not allowed to access the app.",
    //       preferredStyle: UIAlertController.Style.alert)
    //     let okAction = UIAlertAction(title: "OK", style: UIAlertAction.Style.default) {
    //       UIAlertAction in
    //       //Uncomment below to restrict completely
    //       exit(0)
    //     }
    //     alert.addAction(okAction)
    //     self.window?.rootViewController?.present(alert, animated: true, completion: nil)
    //   }
    // }
    
    // FirebaseApp.configure() has been moved above startReactNative()

       // Set up push notification delegate
    UNUserNotificationCenter.current().delegate = self
    application.registerForRemoteNotifications()
    window?.makeKeyAndVisible()
    return true
  }

  func applicationWillResignActive(_ application: UIApplication) {
    // Blur before going to background
    addBlur()
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    // Remove blur when app becomes active
    removeBlur()
    // Also re-check in case screen capture started while inactive
    checkCapture()
  }

  // MARK: - Screenshot & Recording Prevention

  @objc private func screenCaptureChanged() {
    checkCapture()
  }

  private func checkCapture() {
    if UIScreen.main.isCaptured {
      addBlur()
    } else {
      removeBlur()
    }
  }

  private func addBlur() {
    // guard let window = window, blurView == nil else { return }
    // let blur = UIBlurEffect(style: .systemChromeMaterialDark)
    // let view = UIVisualEffectView(effect: blur)
    // view.frame = window.bounds
    // view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    // window.addSubview(view)
    // blurView = view
  }

  private func removeBlur() {
    // blurView?.removeFromSuperview()
    // blurView = nil
  }

  public func isDeviceJailbroken() -> Bool {
    #if arch(i386) || arch(x86_64)
      return true
    #else
      let fileManager = FileManager.default

      if fileManager.fileExists(atPath: "/bin/bash")
        || fileManager.fileExists(atPath: "/usr/sbin/sshd")
        || fileManager.fileExists(atPath: "/etc/apt")
        || fileManager.fileExists(atPath: "/private/var/lib/apt/")
        || fileManager.fileExists(atPath: "/Applications/Cydia.app")
        || fileManager.fileExists(atPath: "/Applications/Frida.app")
        || fileManager.fileExists(atPath: "/Applications/Magisk Manager.app")
        || fileManager.fileExists(atPath: "/Library/MobileSubstrate/MobileSubstrate.dylib")
      {
        return true
      } else {
        return false
      }
    #endif
  }

  // MARK: - Push Notification Handling

  func application(_ application: UIApplication,
                   didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Messaging.messaging().apnsToken = deviceToken
  }

  func application(_ application: UIApplication,
                   didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Failed to register for remote notifications: \(error)")
  }

  // MARK: - UNUserNotificationCenterDelegate

  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              willPresent notification: UNNotification,
                              withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    // Show notification banner even when app is in foreground
    completionHandler([.banner, .sound, .badge])
  }

  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              didReceive response: UNNotificationResponse,
                              withCompletionHandler completionHandler: @escaping () -> Void) {
    // Handle notification tap
    completionHandler()
  }


}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)  // ⬅️ initialize the splash screen
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
