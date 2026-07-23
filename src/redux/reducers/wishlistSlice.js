import { createSlice } from '@reduxjs/toolkit';
import { saveWishlistToStorage, clearWishlistFromStorage } from '../../utils/wishlistStorage';

const initialState = {
    wishlistItems: [],
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlistItem: (state, action) => {
            const productId = action.payload;
            const existingIndex = state.wishlistItems.findIndex(item => item === productId);

            if (existingIndex >= 0) {
                // Remove from wishlist
                state.wishlistItems.splice(existingIndex, 1);
            } else {
                // Add to wishlist
                state.wishlistItems.push(productId);
            }
            // Save to storage immediately
            saveWishlistToStorage(state.wishlistItems);
        },
        setWishlistItems: (state, action) => {
            state.wishlistItems = action.payload || [];
            // Save to storage when setting items
            saveWishlistToStorage(state.wishlistItems);
        },
        clearWishlist: (state) => {
            state.wishlistItems = [];
            clearWishlistFromStorage();
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    toggleWishlistItem,
    setWishlistItems,
    clearWishlist,
    setLoading,
    setError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;