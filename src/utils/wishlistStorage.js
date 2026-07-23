import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_STORAGE_KEY = '@style_union_wishlist';

export const saveWishlistToStorage = async (wishlistItems) => {
    try {
        await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
        console.error('Error saving wishlist:', error);
    }
};

export const loadWishlistFromStorage = async () => {
    try {
        const wishlistData = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
        return wishlistData ? JSON.parse(wishlistData) : [];
    } catch (error) {
        console.error('Error loading wishlist:', error);
        return [];
    }
};

export const clearWishlistFromStorage = async () => {
    try {
        await AsyncStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing wishlist:', error);
    }
};