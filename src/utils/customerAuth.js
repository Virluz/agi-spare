import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEYS = {
    ACCESS_TOKEN: 'customerAccessToken',
    EXPIRES_AT: 'tokenExpiresAt',
};

export const saveAuthToken = async (accessToken, expiresAt) => {
    try {
        await AsyncStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken);
        await AsyncStorage.setItem(AUTH_KEYS.EXPIRES_AT, expiresAt);
    } catch (error) {
        console.error('Error saving auth token:', error);
    }
};

export const getAuthToken = async () => {
    try {
        const token = await AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
        const expiresAt = await AsyncStorage.getItem(AUTH_KEYS.EXPIRES_AT);

        if (!token || !expiresAt) {
            return null;
        }

        // Check if token is expired
        const expiryDate = new Date(expiresAt);
        if (expiryDate < new Date()) {
            await clearAuthToken();
            return null;
        }

        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

export const clearAuthToken = async () => {
    try {
        await AsyncStorage.multiRemove([AUTH_KEYS.ACCESS_TOKEN, AUTH_KEYS.EXPIRES_AT]);
    } catch (error) {
        console.error('Error clearing auth token:', error);
    }
};

export const isAuthenticated = async () => {
    const token = await getAuthToken();
    return !!token;
};