import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from './Constants';
import { NativeModules } from 'react-native';
const NativeShield = NativeModules ? NativeModules?.DeviceShield : null;


const setUserData = async userData => {
    try {
        const encrptedUserData = await NativeShield?.encrypt(JSON.stringify(userData));
        await AsyncStorage.setItem(
            Constants.LOGGED_IN_USER_DATA,
            encrptedUserData,
        );
    } catch (err) {
        console.log(err);
    }
};


const getUserData = () =>
    new Promise(async resolve => {
        try {
            const userData = await AsyncStorage.getItem(
                Constants.LOGGED_IN_USER_DATA,
            );
            if (!userData) return resolve(null);
            const decryptedUserData = await NativeShield?.decrypt(userData);

            const userObj = JSON.parse(decryptedUserData);

            resolve(userObj);
        } catch (error) {
            resolve(null);
        }
    });

const setIsLoggedIn = async (isLoggedIn) => {
    try {
        await AsyncStorage.setItem(
            Constants.IS_LOGGED_IN,
            isLoggedIn
        );
    } catch (err) {
        console.log(err);
    }
}



const getIsLoggedIn = () =>
    new Promise(async resolve => {
        try {
            const data = await AsyncStorage.getItem(
                Constants.IS_LOGGED_IN,
            );
            const userObj = data;
            resolve(userObj);
        } catch (error) {
            resolve(null);
        }
    });

const clearUserData = async () => {
    await AsyncStorage.removeItem(Constants.LOGGED_IN_USER_DATA);
};


const setLanguage = async lang => {
    await AsyncStorage.setItem('lang', lang);
};

const getLanguage = async () => {
    let language = await AsyncStorage.getItem('lang');
    language = language ?? "En";
    return language;
};


const clear = async () => {
    try {
        AsyncStorage.clear();
    } catch (error) {

    }
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter(key => key !== 'APNsToken');
        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
        }
        console.log(`📦 Cleared all except APNsToken`);
    } catch (e) {
        console.error('Error clearing AsyncStorage:', e);
    }
}
const setScheme = async screenName => {
    await AsyncStorage.setItem('Scheme', screenName);
};

const getScheme = async () => {
    return await AsyncStorage.getItem('Scheme');
};

const setShowAllTimePopup = async value => {
    await AsyncStorage.setItem('ShowAllTimePopup', value);
};

const getShowAllTimePopup = async () => {
    return await AsyncStorage.getItem('ShowAllTimePopup');
};

const setGPSEnablePopup = async value => {
    await AsyncStorage.setItem('ShowGPSEnable', value);
};

const getGPSEnablePopup = async () => {
    return await AsyncStorage.getItem('ShowGPSEnable');
};

const setAppSettings = async appSettings => {
    try {
        const encrptedSettings = await NativeShield?.encrypt(JSON.stringify(appSettings));
        await AsyncStorage.setItem(
            Constants.APP_SETTINGS,
            encrptedSettings,
        );
    } catch (err) {
        console.log(err);
    }
};

const getAppSettings = () => {
    return new Promise(async (resolve) => {
        try {
            const userData = await AsyncStorage.getItem(
                Constants.APP_SETTINGS
            );

            if (!userData) return resolve(null);
            const decryptedUserData = await NativeShield?.decrypt(userData);

            const userObj = JSON.parse(decryptedUserData);
            resolve(userObj);
        } catch (error) {
            resolve(null);
        }
    });
};

const setCompanyDetails = async (data) => {
    try {
        const encrptedData = await NativeShield?.encrypt(JSON.stringify(data));

        await AsyncStorage.setItem(
            Constants.COMPANY_DATA,
            encrptedData,
        );
    } catch (err) {
        console.log(err);
    }
}

const getCompanyDetails = () => {
    return new Promise(async resolve => {
        try {
            const userData = await AsyncStorage.getItem(
                Constants.COMPANY_DATA,
            );
            if (!userData) return resolve(null);

            const decryptedCompanyData = await NativeShield?.decrypt(userData);

            const userObj = JSON.parse(decryptedCompanyData);
            resolve(userObj);
        } catch (error) {
            resolve(null);
        }
    });
}

const clearCompanyDetails = async (data) => {
    await AsyncStorage.removeItem(Constants.COMPANY_DATA);
}

const setPins = async (data) => {
    try {
        await AsyncStorage.setItem(
            Constants.SSL_PINS,
            JSON.stringify(data),
        );
    } catch (err) {
        console.log(err);
    }
}

const getPins = async () => {
    return new Promise(async resolve => {
        try {
            const userData = await AsyncStorage.getItem(
                Constants.SSL_PINS,
            );
            if (!userData) return resolve(null);

            const pinsObj = JSON.parse(userData);

            const pin1 = await NativeShield?.decrypt(pinsObj?.pin1);
            const pin2 = await NativeShield?.decrypt(pinsObj?.pin2);
            const pin3 = await NativeShield?.decrypt(pinsObj?.pin3);


            resolve([pin1, pin2, pin3]);
        } catch (error) {
            resolve(null);
        }
    });
}

const setAPNsToken = async token => {
    await AsyncStorage.setItem('APNsToken', token);
};

const getAPNsToken = async () => {
    return await AsyncStorage.getItem('APNsToken');
};

// Onboarding seen flag
const setHasSeenOnboard = async (value = 'true') => {
    await AsyncStorage.setItem(Constants.HAS_SEEN_ONBOARD, value);
};

const getHasSeenOnboard = async () => {
    return await AsyncStorage.getItem(Constants.HAS_SEEN_ONBOARD);
};

const SecureStorage = {
    setUserData, getAppSettings, setAppSettings, setPins, getPins,
    setIsLoggedIn, getIsLoggedIn, setCompanyDetails, getCompanyDetails, clearCompanyDetails,
    getUserData, setShowAllTimePopup, getShowAllTimePopup, setAPNsToken, getAPNsToken,
    setLanguage, setGPSEnablePopup, getGPSEnablePopup,
    getLanguage,
    clear,
    setScheme, getScheme, clearUserData,
    setHasSeenOnboard, getHasSeenOnboard,
};

export default SecureStorage;
