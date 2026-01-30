import VersionCheck from 'react-native-version-check';
import { Platform, Linking, Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * AppVersionCheck Service
 * Handles force app update functionality for both iOS and Android
 * Checks version from App Store / Play Store
 */

class AppVersionCheckService {
    constructor() {
        this.isChecking = false;
        this.currentVersion = DeviceInfo.getVersion();
        this.buildNumber = DeviceInfo.getBuildNumber();
    }

    /**
     * Get current app version
     */
    getCurrentVersion() {
        return this.currentVersion;
    }

    /**
     * Get current build number
     */
    getBuildNumber() {
        return this.buildNumber;
    }

    /**
     * Get latest version from store
     * @returns {Promise<{version: string, storeUrl: string}>}
     */
    async getLatestVersion() {
        try {
            // Get package/bundle identifier
            const bundleId = DeviceInfo.getBundleId();

            const latestVersion = await VersionCheck.getLatestVersion({
                provider: Platform.OS === 'ios' ? 'appStore' : 'playStore',
                packageName: bundleId, // Works for both platforms
                ignoreErrors: true,
            });

            // Generate store URL
            let storeUrl;
            if (Platform.OS === 'ios') {
                // For iOS, use the App Store URL format
                // You can also use: `https://apps.apple.com/app/id${APP_STORE_ID}`
                storeUrl = await VersionCheck.getStoreUrl({
                    appID: bundleId,
                    appName: DeviceInfo.getApplicationName(),
                });
            } else {
                // For Android, use Play Store URL
                storeUrl = `https://play.google.com/store/apps/details?id=${bundleId}`;
            }

            return {
                version: latestVersion,
                storeUrl: storeUrl,
            };
        } catch (error) {
            console.error('Error fetching latest version:', error);
            throw error;
        }
    }

    /**
     * Compare versions
     * @param {string} currentVersion - Current app version
     * @param {string} latestVersion - Latest available version
     * @returns {number} - Returns 1 if update needed, 0 if same, -1 if current is newer
     */
    compareVersions(currentVersion, latestVersion) {
        const current = currentVersion.split('.').map(Number);
        const latest = latestVersion.split('.').map(Number);

        for (let i = 0; i < Math.max(current.length, latest.length); i++) {
            const currentPart = current[i] || 0;
            const latestPart = latest[i] || 0;

            if (latestPart > currentPart) return 1;
            if (latestPart < currentPart) return -1;
        }

        return 0;
    }

    /**
     * Check if update is needed
     * @returns {Promise<{needsUpdate: boolean, latestVersion: string, storeUrl: string}>}
     */
    async checkForUpdate() {
        if (this.isChecking) {
            console.log('Version check already in progress');
            return { needsUpdate: false };
        }

        try {
            this.isChecking = true;

            const { version: latestVersion, storeUrl } = await this.getLatestVersion();

            console.log(`Current Version: ${this.currentVersion}`);
            console.log(`Latest Version: ${latestVersion}`);
            console.log(`Store URL: ${storeUrl}`);

            const comparison = this.compareVersions(this.currentVersion, latestVersion);
            const needsUpdate = comparison > 0;

            return {
                needsUpdate,
                currentVersion: this.currentVersion,
                latestVersion,
                storeUrl,
            };
        } catch (error) {
            console.error('Error checking for update:', error);
            return { needsUpdate: false, error: error.message };
        } finally {
            this.isChecking = false;
        }
    }

    /**
     * Open store page for update
     * @param {string} storeUrl - URL to the store page
     */
    async openStore(storeUrl) {
        try {
            const supported = await Linking.canOpenURL(storeUrl);

            if (supported) {
                await Linking.openURL(storeUrl);
            } else {
                console.error(`Cannot open URL: ${storeUrl}`);
                Alert.alert(
                    'Error',
                    'Unable to open store. Please update the app manually.',
                );
            }
        } catch (error) {
            console.error('Error opening store:', error);
            Alert.alert(
                'Error',
                'Unable to open store. Please update the app manually.',
            );
        }
    }

    /**
     * Check for update with custom backend API
     * This allows you to control force update from your backend
     * @param {string} apiUrl - Your backend API endpoint
     * @returns {Promise<{forceUpdate: boolean, latestVersion: string, message: string}>}
     */
    async checkForUpdateFromAPI(apiUrl) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    platform: Platform.OS,
                    currentVersion: this.currentVersion,
                    buildNumber: this.buildNumber,
                }),
            });

            const data = await response.json();

            return {
                forceUpdate: data.forceUpdate || false,
                latestVersion: data.latestVersion || this.currentVersion,
                message: data.message || 'A new version is available',
                storeUrl: data.storeUrl,
            };
        } catch (error) {
            console.error('Error checking update from API:', error);
            // Fallback to store check if API fails
            return await this.checkForUpdate();
        }
    }

    /**
     * Perform version check and show appropriate UI
     * @param {Function} onUpdateRequired - Callback when update is required
     * @param {string} customApiUrl - Optional custom API endpoint
     */
    async performVersionCheck(onUpdateRequired, customApiUrl = null) {
        try {
            let updateInfo;

            if (customApiUrl) {
                // Check from custom backend API first
                updateInfo = await this.checkForUpdateFromAPI(customApiUrl);
            } else {
                // Check from store directly
                updateInfo = await this.checkForUpdate();
            }

            if (updateInfo.needsUpdate || updateInfo.forceUpdate) {
                if (onUpdateRequired && typeof onUpdateRequired === 'function') {
                    onUpdateRequired(updateInfo);
                }
            }

            return updateInfo;
        } catch (error) {
            console.error('Error performing version check:', error);
            return { needsUpdate: false, error: error.message };
        }
    }
}

// Export singleton instance
export default new AppVersionCheckService();
