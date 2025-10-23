// appSlice.js
import { createSlice } from '@reduxjs/toolkit';
import SecureStorage from "../../utils/SecureStorage";

const initialState = {
    isLoading: false,
    user: {},
    userData: {},
    isDoLogout: false,
    colorScheme: 'light',
    companyCode: '',
    apiCredentials: {},
    appSettings: {},
    userLocation: null,
    isLoggedInGlobal: false
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        logout(state) {
            SecureStorage.clearUserData();
            // Return initial state
            return initialState;
        },
        setUserData(state, action) {
            state.userData = action.payload;
        },
        setIsDoLogout(state, action) {
            state.isDoLogout = action.payload;
        },
        setColorScheme(state, action) {
            state.colorScheme = action.payload;
        },
        setApiCredentials(state, action) {
            state.apiCredentials = action.payload;
        },
        setAppSettings(state, action) {
            state.appSettings = action.payload;
        },
        setUserLocation(state, action) {
            state.userLocation = action.payload;
        },
        setIsLoggedIn(state, action) {
            state.isLoggedInGlobal = action.payload;
        },
        setCompanyCode(state, action) {
            state.companyCode = action.payload;
        }
    }
});

// Export actions
export const {
    logout,
    setUserData,
    setIsDoLogout,
    setColorScheme,
    setApiCredentials,
    setAppSettings,
    setUserLocation,
    setIsLoggedIn,
    setCompanyCode
} = appSlice.actions;

// Export reducer
export default appSlice.reducer;