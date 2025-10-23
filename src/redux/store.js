
// store.js
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './reducers/appSlice';
import cartReducer from './reducers/cartSlice';
import collectionReducer from './reducers/collectionSlice';
import wishlistReducer from './reducers/wishlistSlice';


import logger from 'redux-logger';

export const store = configureStore({
    reducer: {
        app: appReducer,
        cart: cartReducer,
        collections: collectionReducer,
        wishlist: wishlistReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(logger),
    // Redux Thunk middleware is included by default
    // DevTools are enabled by default in development
});

export default store;