import AsyncStorage from "@react-native-async-storage/async-storage";
import eventBus from "../service/EventBus";

// recentlyViewedUtils.js
const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';

export const getRecentlyViewedIds = async () => {
    const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);

    console.log("store", stored);

    if (!stored) return [];
    return JSON.parse(stored);
};

export const addToRecentlyViewed = async (productId) => {

    console.log("addToRecentlyViewed ", productId);
    const recentlyViewed = await getRecentlyViewedIds();
    // Remove if already exists to avoid duplicates
    console.log("addToRecentlyViewed recentlyViewed ", recentlyViewed);

    const filtered = recentlyViewed.filter(id => id !== productId);

    console.log("addToRecentlyViewed filtered ", filtered);
    // Add to beginning of array
    filtered.unshift(productId);

    // Keep only the last 10-20 items
    const limited = filtered.slice(0, 15);
    console.log("addToRecentlyViewed limited ", limited);

    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(limited));

    eventBus.publish('ProductViewed')
};

export const clearRecentlyViewed = async () => {
    if (typeof window === 'undefined') return;
    await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
};