
import { fetchCurrentLocation } from '../utils/Helper';
import { updateUserLocation } from '../api/requests';

let trackingInterval = null;


export async function startTracking({ appSettings, apiCredentials }) {

    try {
        // Fetch immediately, then every 2 mins

        updateLocation(apiCredentials)

        const interval = (Number.parseInt(appSettings?.LocationTrackingActiveFrequencyMinutes, 10) || 0) * 60 * 1000 || 1 * 60 * 1000;

        console.log("interval interval", interval, appSettings)

        trackingInterval = setInterval(() => updateLocation(apiCredentials), interval);

    } catch (error) {
        console.log("updateLocation ::: ", error);

    }

}

const updateLocation = async (apiCredentials) => {

    const { success, newPosition, error } = await fetchCurrentLocation();
    if (success) {
        try {
            const response = await updateUserLocation({
                "MobileRecipientId": apiCredentials?.username,
                "Latitude": newPosition?.latitude,
                "Longitude": newPosition?.longitude,
                "Mode": "auto",
                "LocationProvider": "GPS"
            });

        } catch (error) {
            console.log("startTracking Error", error);
        }

    }
}

export function stopTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
}

