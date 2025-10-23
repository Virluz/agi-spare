import CoreLocation
import Foundation
import React

@objc(LocationModule)
class LocationModule: RCTEventEmitter, CLLocationManagerDelegate {
    private var locationManager: CLLocationManager?
    private var isTracking = false
    private var cachedLocations: [[String: Any]] = []
    private let maxCacheSize = 100
    private var hasActiveListeners = false

    private let locationEvent = "onLocationUpdateNative"
    private let debugEvent = "locationDebugEvent"

    override init() {
        super.init()
        self.locationManager = CLLocationManager()
        self.locationManager?.delegate = self
        self.locationManager?.desiredAccuracy = kCLLocationAccuracyBest
        self.locationManager?.allowsBackgroundLocationUpdates = true
        self.locationManager?.pausesLocationUpdatesAutomatically = false
        self.locationManager?.distanceFilter = kCLDistanceFilterNone

        // Start service automatically
    }

    override func supportedEvents() -> [String]! {
        return [locationEvent, debugEvent]
    }

    override func startObserving() {
        hasActiveListeners = true
        resendCachedLocations()
    }

    override func stopObserving() {
        hasActiveListeners = false
    }

    @objc func startLocationService() {
        guard let locationManager = locationManager else { return }

        let status = CLLocationManager.authorizationStatus()
        print("Authorization status: \(status.rawValue)")

        if status == .notDetermined {
            locationManager.requestAlwaysAuthorization()
        } else if status == .authorizedAlways || status == .authorizedWhenInUse {
            startTracking()
        }
    }

    @objc func stopLocationService() {
        locationManager?.stopUpdatingLocation()
        locationManager?.stopMonitoringSignificantLocationChanges()
        isTracking = false
        print("Location service stopped")
    }

    @objc func resendCachedLocations() {
        guard hasActiveListeners && !cachedLocations.isEmpty else { return }

        for location in cachedLocations {
            sendEvent(withName: locationEvent, body: location)
        }
        cachedLocations.removeAll()
        print("Resent \(cachedLocations.count) locations")
    }

    private func startTracking() {
        guard !isTracking else { return }

        locationManager?.startUpdatingLocation()
        locationManager?.startMonitoringSignificantLocationChanges()
        isTracking = true
        print("Location service started")
    }

    func locationManager(
        _ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus
    ) {
        print("Authorization changed: \(status.rawValue)")

        if status == .authorizedAlways || status == .authorizedWhenInUse {
            startTracking()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }

        let locationData: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "timestamp": location.timestamp.timeIntervalSince1970 * 1000,
        ]

        print(
            "Location received: \(location.coordinate.latitude), \(location.coordinate.longitude)")

        if hasActiveListeners {
            sendEvent(withName: locationEvent, body: locationData)
        } else {
            cacheLocation(locationData)
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
    }

    private func cacheLocation(_ location: [String: Any]) {
        if cachedLocations.count >= maxCacheSize {
            cachedLocations.removeFirst()
        }
        cachedLocations.append(location)
        print("Location cached. Total: \(cachedLocations.count)")
    }

    // FIX: Correct requiresMainQueueSetup implementation
    @objc override class func requiresMainQueueSetup() -> Bool {
        return true
    }
}
