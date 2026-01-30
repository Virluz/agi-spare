/**
 * Force Update Configuration
 * Modify these settings to customize the force update behavior
 */

export const ForceUpdateConfig = {
    /**
     * Enable or disable force update feature
     * Set to false to temporarily disable without removing code
     */
    ENABLED: true,

    /**
     * Delay before checking for updates (in milliseconds)
     * Default: 2000ms (2 seconds)
     * Recommended: 1000-5000ms to allow app to initialize
     */
    CHECK_DELAY: 2000,

    /**
     * Check for updates on app resume (not just launch)
     * Default: false (only checks on launch)
     * Set to true to check every time user opens the app
     */
    CHECK_ON_RESUME: false,

    /**
     * Cooldown period between checks (in milliseconds)
     * Only used if CHECK_ON_RESUME is true
     * Default: 3600000ms (1 hour)
     * Prevents checking too frequently
     */
    CHECK_COOLDOWN: 3600000,

    /**
     * Custom API endpoint for version checking
     * Leave empty to use store APIs directly
     * Example: 'https://api.yourdomain.com/app-version-check'
     */
    CUSTOM_API_URL: '',

    /**
     * Android package name
     * Must match the package name in build.gradle
     */
    ANDROID_PACKAGE_NAME: 'in.stunion',

    /**
     * Update modal customization
     */
    MODAL: {
        /**
         * Default update message
         * Can be overridden by API response
         */
        DEFAULT_MESSAGE:
            'A new version of the app is available. Please update to continue using the app with the latest features and improvements.',

        /**
         * Button text
         */
        UPDATE_BUTTON_TEXT: 'Update Now',

        /**
         * Store indicator text
         */
        IOS_STORE_TEXT: 'Opens App Store',
        ANDROID_STORE_TEXT: 'Opens Google Play',

        /**
         * Allow dismissing the modal (not recommended for force updates)
         * Set to true to add a "Later" button
         */
        ALLOW_DISMISS: false,

        /**
         * Animation type for modal
         * Options: 'fade', 'slide', 'none'
         */
        ANIMATION_TYPE: 'fade',
    },

    /**
     * Logging configuration
     */
    LOGGING: {
        /**
         * Enable detailed console logs
         * Useful for debugging
         */
        ENABLED: true,

        /**
         * Log prefix for easy filtering
         */
        PREFIX: '[ForceUpdate]',
    },

    /**
     * Retry configuration for version check
     */
    RETRY: {
        /**
         * Enable automatic retry on failure
         */
        ENABLED: true,

        /**
         * Maximum number of retry attempts
         */
        MAX_ATTEMPTS: 3,

        /**
         * Delay between retries (in milliseconds)
         */
        RETRY_DELAY: 5000,
    },

    /**
     * Feature flags for future enhancements
     */
    FEATURES: {
        /**
         * Show app changelog in update modal
         */
        SHOW_CHANGELOG: false,

        /**
         * Track analytics events
         */
        TRACK_ANALYTICS: false,

        /**
         * Show update progress/download status
         */
        SHOW_PROGRESS: false,
    },
};

/**
 * Helper function to log messages
 * @param {string} message - Message to log
 * @param {any} data - Additional data to log
 */
export const logUpdate = (message, data = null) => {
    if (ForceUpdateConfig.LOGGING.ENABLED) {
        const prefix = ForceUpdateConfig.LOGGING.PREFIX;
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }
};

/**
 * Helper function to check if enough time has passed since last check
 * @param {number} lastCheckTime - Timestamp of last check
 * @returns {boolean} - True if cooldown period has passed
 */
export const shouldCheckForUpdate = (lastCheckTime) => {
    if (!lastCheckTime) return true;
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTime;
    return timeSinceLastCheck >= ForceUpdateConfig.CHECK_COOLDOWN;
};

export default ForceUpdateConfig;
