import fonts, { heightPixel, widthPixel } from './fonts';

import Constants from './Constants';
import { showErrorMsg, showSuccessMsg } from '../widgets/FlashMessages';
import { setAuthorizationHeader, setFormDataHeader, setJSONHeader } from '../api/config';
const { Text, Image, View, Dimensions, Alert, Linking, useColorScheme, Platform, StyleSheet, PermissionsAndroid, NativeModules, TouchableOpacity } = require('react-native');
import NetInfo from '@react-native-community/netinfo';
import AppStyles from '../styles/AppStyles';
import { getMessaging } from '@react-native-firebase/messaging';
import { Bell, Folder, Gift, Grid2X2Plus, Home, MapPin, Settings, ShoppingBag, Sparkle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SecureStorage from './SecureStorage';
import { useSelector } from 'react-redux';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
const { LocationModule } = NativeModules
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const PASSWORD_REGX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const NUMBER_REGX = /^[6-9]\d{9}$/; // indian phone number validation


const _getValidateText = (text, center) => {
  return (
    <Text
      style={{ color: 'red' }}>
      {text}
    </Text>
  );
};

const _isEmpty = obj => {
  return Object.keys(obj).length === 0;
};

const toSentenceCase = (str) => {
  return str?.toLowerCase()?.split(' ')?.map(function (word) {
    return word?.charAt(0)?.toUpperCase() + word?.slice(1);
  })?.join(' ');
}
const getTabIcon = (name, color, focused, onPress) => {


  const translateKeys = {
    Dashboard: "",
  }

  let iconView;

  switch (name) {
    case 'Home':
      iconView = (
        <Image style={{ height: 24, width: 24, tintColor: color }} source={require('../../assets/images/style_icon.png')} />)
      break;
    case 'Category':
      iconView = (<Image style={{ height: 24, width: 24, tintColor: color }} source={require('../../assets/images/categories.png')} />)

      break;
    case 'Cart':
      iconView = (<Image style={{ height: 24, width: 24, tintColor: color }} source={require('../../assets/images/cart.png')} />)
      break;

    case 'New In':
      iconView = (<Image style={{ height: 24, width: 24, tintColor: color }} source={require('../../assets/images/fluid.png')} />)
      break;

    case 'Rewards':
      iconView = (<Image style={{ height: 24, width: 24, tintColor: color }} source={require('../../assets/images/rewards.png')} />)
      break;
    default:
      break;
  }


  return (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        // backgroundColor: focused ? 'white' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: heightPixel(2),
        width: ((DEVICE_WIDTH - 32) / 5) - 5,
        // backgroundColor: 'red'
      }}
      onPress={onPress}
    >

      {iconView}

      {/* <Text style={{ fontSize: 11, color: color }}>
        {name}
      </Text> */}

    </TouchableOpacity>
  );
};

const _getFilePicker = async () => {
  try {
    const res = await DocumentPicker.pick({
      type: DocumentPicker.types.images,
      allowMultiSelection: true,
    });
    console.log('RES', res);

    return res;
  } catch (err) {
    console.log('_getFilePicker', err);
    return null;
  }
  // onUpload(res);
};

const _getHorizontalPadding = padding => {
  return <View style={{ width: widthPixel(padding) }} />;
};

const _getVerticalPadding = padding => {
  return <View style={{ height: heightPixel(padding) }} />;
};

const _getSeparator = (color) => {
  return (
    <View style={{
      height: widthPixel(1),
      marginHorizontal: widthPixel(-16),
      backgroundColor: color
    }} />
  )
}

const responseApiKeys = {
  FM: {
    awb_no: 'awb_no',
    singature: 'singature',
    status_code: 'status_code',
    name: 'name',
    company_name: 'company_name',
    phone: 'phone',
    type: 'type',
    type_name: 'type_name',
    delivery_by: 'delivery_by',
    address: 'address',
    payment_type: 'payment_type',
    latitude: 'latitude',
    longitude: 'longitude',
  },
  LM: {
    awb_no: 'awb_no',
    singature: 'singature',
    status_code: 'status_code',
    company_name: 'vendor',
    address: 'address',
    payment_type: 'payment_type',
    name: 'name',
    phone: 'phone',
    type: 'shipment_type',
    type_name: 'type_name',
    delivery_by: 'delivery_by',
    total_amount: 'cod_amount',
    latitude: 'latitude',
    longitude: 'longitude',
  },
  RTO: {
    awb_no: 'awb_no',
    singature: 'singature',
    company_name: 'company_name',
    status_code: 'status_code',
    name: 'name',
    phone: 'phone',
    type: 'type',
    address: 'address',
    payment_type: 'payment_type',
    type_name: 'type_name',
    delivery_by: 'delivery_by',
    latitude: 'latitude',
    longitude: 'longitude',
    shipment_data: 'shipment_data',
  },
  RVP: {
    awb_no: 'awb_no',
    singature: 'singature',
    company_name: 'company_name',
    status_code: 'status_code',
    name: 'name',
    phone: 'phone',
    address: 'address',
    payment_type: 'payment_type',
    type: 'type',
    type_name: 'type_name',
    delivery_by: 'delivery_by',
    latitude: 'latitude',
    longitude: 'longitude',
  },
};

const colors = {
  buttonBackground: '#78787A99',
  RED: '#F44336',
  _NEW: '#FF0867',
  _SELLING_FAST: '#000000',
  _RESTOCKED: '#FF8017',
  _OVERSIZED: '#30CF6E',
  _BEST_SELLER: '#0B62FC',
  _RIBBLE: '#414040',
  TRANS_BLACK: 'rgba(0,0,0,0.2)',
  _DARK_GRAY: '#848282',
};

const COUNT_KEYS = {
  CASH: 'cash_collected',
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
  FM: 'fm',
  LM: 'lm',
  RVP: 'rvp',
  RTO: 'rto',
  FAILED: 'failed',
  SUCCESS: 'success',
  PENDING: 'pending',
  TOTAL: 'total',
  T0TAL_ATTEMPTED_PERCENTAGE: 'total_attempted_percentage',
  UPI: 'upi_amount_collected'
}

const _getOldDate = () => {
  const currentDate = new Date();
  const one23YearsAgo = new Date(currentDate);
  one23YearsAgo.setFullYear(currentDate.getFullYear() - 123);
  // console.log(one23YearsAgo);
  return one23YearsAgo;
};

function checkKeys(object, pattern) {
  console.log('object', object, pattern);
  const regex = new RegExp(pattern);
  const result = {};

  Object.keys(object).forEach(key => {
    if (regex.test(key)) {
      result[key] = object[key];
    }
  });

  console.log('result', result);

  return Object.values(result).every(
    value => value != '' && value != undefined,
  );
}

async function deleteFile(path) {
  try {
    let isExist = await RNFS.exists(path);
    if (isExist) {
      await RNFS.unlink(path);
    }
    return true;
  } catch (err) {
    console.log("deleteFile::::::::", err.message);
    return false;
  }
}

const moveFile = async (cacheFilePath, directory = Constants.OTHER_DIRECTORY) => {
  try {
    if (!cacheFilePath) return;
    const exists = await RNFS.exists(cacheFilePath);

    if (exists) {
      const fileName = cacheFilePath.split('/').pop();
      const newPath = `${RNFS.DocumentDirectoryPath}/${directory}/${fileName}`;

      await RNFS.moveFile(cacheFilePath, newPath);

      // Make sure to prepend 'file://' to the newPath
      const newPathWithPrefix = `file://${newPath}`;

      // console.log('File moved successfully. newPath:', newPathWithPrefix);

      return newPathWithPrefix;
    } else {
      console.log('File does not exist at:', cacheFilePath);
      return;
    }
  } catch (error) {
    console.error('Error moving file:', error);
    return;
  }

};


const copyFile = async (cacheFilePath, directory = Constants.OTHER_DIRECTORY) => {
  try {
    if (!cacheFilePath) return;
    const exists = await RNFS.exists(cacheFilePath);

    if (exists) {
      const fileName = cacheFilePath.split('/').pop();
      const newPath = `${RNFS.DocumentDirectoryPath}/${directory}/${fileName}`;

      await RNFS.copyFile(cacheFilePath, newPath);

      // Make sure to prepend 'file://' to the newPath
      const newPathWithPrefix = `file://${newPath}`;

      // console.log('File moved successfully. newPath:', newPathWithPrefix);

      return newPathWithPrefix;
    } else {
      console.log('File does not exist at:', cacheFilePath);
      return;
    }
  } catch (error) {
    console.error('Error moving file:', error);
    return;
  }
}


const createDirectory = async (directory = Constants.OTHER_DIRECTORY) => {
  try {
    const path = `${RNFS.DocumentDirectoryPath}/${directory}`;
    const isExist = await RNFS.exists(path);
    if (!isExist) {
      await RNFS.mkdir(path);
    }
    console.log('createDirectory:::SUCCESS');
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    return false;
  }

}

const downloadFile = (url, directory = Constants.OTHER_DIRECTORY) => {
  try {
    let fileNameWithExtension = url.split('/').pop();
    let directoryPath = `${RNFS.DocumentDirectoryPath}/${directory}`;

    let path = `${directoryPath}/${fileNameWithExtension}`;
    const options = {
      fromUrl: url,
      toFile: path,
    };

    RNFS.downloadFile(options).promise.then(res => {
      if (res.statusCode == 200) {
        console.log('downloadFile::::SUCCESS');
      } else {
        console.log('downloadFile::::', res);
      }
    })

    const localPath = `file://${path}`;
    return localPath;
  }
  catch (err) {
    console.log('downloadFile', err);
    return null;
  }
}

const deleteDirectory = async (directory = Constants.OTHER_DIRECTORY) => {
  try {
    const path = `${RNFS.DocumentDirectoryPath}/${directory}`;
    const isExist = await RNFS.exists(path);
    if (isExist) {
      await RNFS.unlink(path);
    }
    console.log('deleteDirectory:::SUCCESS');
  }

  catch (err) {
    console.log('deleteDirectory::::', err);
  }
}

const getRegionFromCoordinates = coordinates => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return null; // Return null for invalid input
  }

  let validCoordinates = coordinates.filter(coord => coord && typeof coord.latitude === 'number' && typeof coord.longitude === 'number');
  if (validCoordinates.length === 0) {
    return null; // Return null if no valid coordinates are found
  }

  let minLat = validCoordinates[0].latitude;
  let maxLat = validCoordinates[0].latitude;
  let minLng = validCoordinates[0].longitude;
  let maxLng = validCoordinates[0].longitude;

  for (let i = 1; i < validCoordinates.length; i++) {
    const { latitude, longitude } = validCoordinates[i];

    // Update minimum and maximum values
    minLat = Math.min(minLat, latitude);
    maxLat = Math.max(maxLat, latitude);
    minLng = Math.min(minLng, longitude);
    maxLng = Math.max(maxLng, longitude);
  }

  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: 0.0050,
    longitudeDelta: 0.0050,
  };

  return region;
};


const getDeviceInfo = () => {
  // return { "OSVersion": "IOS6", "Model": "IPhone", "AppVersion": "1.0", "Platform": "Plft" }
  return new Promise((resolve, reject) => {
    Promise.all([DeviceInfo.getSystemVersion(), DeviceInfo.getModel(), DeviceInfo.getVersion()])
      .then(([systemVersion, model, version]) => {

        const deviceInfo = {
          OSVersion: systemVersion,
          Model: model,
          AppVersion: version,
          Platform: Platform.OS,
        };
        resolve(deviceInfo);
      })
      .catch(error => {
        console.error('Error retrieving device info:', error);
        reject(error);
      });
  });
};
const getAccessbility = (label, type) => {
  switch (type) {
    case Constants.ACESSBILITY_LABEL.BUTTON:
      return {
        label: `Button_${label}`,
      };
    case Constants.ACESSBILITY_LABEL.TEXTINPUT:
      return {
        label: `textInput${label}`,
      };

    default:
      return {
        label: label,
      };
  }
};

const getCameraIcon = (size = 12, color = 'black') => (
  <Camera
    size={heightPixel(size)}
    color={color}
  />
)

const getFirebaseToken = async () => {
  if (Platform.OS === 'ios') {
    try {
      const token = await SecureStorage.getAPNsToken();
      return token;

    } catch (error) {
      console.log(error, "error");
      return "notoken";

    }
  }
  try {
    const token = await getMessaging().getToken();
    console.log('TOKEN', token);
    return token;
  } catch (error) {
    console.log('TOKEN', error);
    return null;
  }


  return token;
};

const getFormData = (object) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(object)) {
    // Check if the value is an array, and stringify it if needed
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  }

  return formData;
};
const appendFilesFormData = (formData, files) => {
  for (const [key, value] of Object.entries(files)) {
    let file = {
      uri: value,
      name: value.split('/').pop(),
      type: 'image/jpg',
    }

    formData.append(key, file);
  }
  return formData;
};


const callAPI = async ({
  apiMethod,
  callBack = () => { }, onComplete = () => { }, onFail = () => { },
  data, showSuccess = true, isFormData = false, snackBarRef
}) => {
  try {
    let isConnected = await isOnline();
    if (!isConnected) {
      onComplete();
      showErrorMsg("No internet connection", null, snackBarRef);
      return;
    }
    if (isFormData) {
      setFormDataHeader();
    }
    const response = await apiMethod(data);
    // console.log('callAPI response::::', response);
    if (response?.success) {
      onComplete();
      if (showSuccess) {
        showSuccessMsg(response?.message, null, snackBarRef);
      }
      callBack(response?.data, response?.status_code);
    }
    else {
      if (response?.status_code != 401)
        onFail();
      onComplete();
      showErrorMsg(response?.message ?? "Something went wrong in server side", null, snackBarRef);
    }
    if (isFormData) {
      setJSONHeader();
    }
  }
  catch (err) {
    if (isFormData) {
      setJSONHeader();
    }
    onFail();
    onComplete();
    showErrorMsg(Constants.DEFAULT_ERROR, null, snackBarRef);
    console.log('callAPI err', err);
  }
}


const isOnline = () => {
  return new Promise((resolve, reject) => {
    NetInfo.fetch().then(state => {
      // console.log('Connection type', state.type);
      // console.log('Is connected?', state.isConnected);
      resolve(state.isConnected);
    });
  });
};

const debounceScanner = (fn) => {
  let previousCodeValue = null;

  return function (...args) {
    const context = this;
    const currentCodeValue = args[0]?.[0].value; // Assuming the code value is the first element in the array

    // Check if the code value has changed
    if (currentCodeValue !== previousCodeValue) {
      fn.apply(context, args);
      previousCodeValue = currentCodeValue;
    }
  };
}

const debounce = (func, delay) => {
  let inDebounce
  return function () {
    const context = this
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
}

const showAlert = ({ title, message, onYes, cancelable }) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Yes',
        onPress: onYes,
      },
      {
        text: 'No',
        onPress: null,
      },
    ],
    { cancelable: cancelable },
  );
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

const maskPhoneNumber = (number) => {
  if (!number || typeof number !== 'string') return '';

  // Remove all non-digit characters first
  const digitsOnly = number.replace(/\D/g, '');

  // Handle cases where number is too short to mask
  if (digitsOnly.length <= 4) return digitsOnly;

  // Keep first 2 and last 2 digits visible
  const firstTwo = digitsOnly.slice(0, 1);
  const lastTwo = digitsOnly.slice(-1);

  // Mask the middle digits
  const starsCount = Math.max(0, digitsOnly.length - 2);

  return `${firstTwo}${'*'.repeat(starsCount)}${lastTwo}`;
};

const maskEmail = (email) => {
  if (typeof email !== 'string') return '';
  if (!email.includes('@')) return email;

  const [prefix, domain] = email.split('@');
  if (prefix.length <= 2) return email;

  const starsCount = Math.max(0, prefix.length - 2);
  return `${prefix[0]}${'*'.repeat(starsCount)}${prefix.slice(-1)}@${domain}`;
};

const getReadableDate = (utcString) => {
  if (!utcString) return '';

  // Ensure UTC - if no Z or offset, append Z
  const iso = utcString.match(/Z|[+-]\d{2}:\d{2}$/)
    ? utcString
    : utcString + 'Z';

  const dateUtc = new Date(iso);
  if (isNaN(dateUtc)) return utcString; // invalid date fallback

  const opts = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  // Format with Intl, looks like "June 18, 2019, 03:07 PM"
  const formatted = dateUtc.toLocaleString('en-US', opts);

  // A bit of cleanup for the " at " style:
  // -> "June 18 2019 at 03:07 PM"
  return formatted
    .replace(',', '')          // remove comma after day
    .replace(',', ' at');      // replace the next comma before time
};
const generateTokenFromUsernamePassword = (username, password) => {

  const base64Credentials = btoa(`${username}:${password}`);

  console.log("base64Credentials", base64Credentials);


  return base64Credentials
}

const getiOSPadding = () => {
  const insets = useSafeAreaInsets();

  // Platform-specific bottom inset
  const bottomInset = Platform.select({
    ios: insets.bottom,
    android: 0 // Or a smaller value if needed
  });

  return bottomInset;
}

function getFileExtension(url) {
  if (!url) return "";
  let fname = url.substring(url.lastIndexOf('/') + 1);
  const q = fname.indexOf('?');
  if (q !== -1) fname = fname.substring(0, q);
  const h = fname.indexOf('#');
  if (h !== -1) fname = fname.substring(0, h);
  const i = fname.lastIndexOf('.');
  return (i !== -1 && i < fname.length - 1) ? fname.substring(i + 1) : "";
}

const handleLogout = () => {

  SecureStorage.setIsLoggedIn("0");
}

const noDataView = (scheme, title = 'No Data Available', desc, image) => {
  const localStyles = getLocalStyles(AppStyles.colorSet[scheme]);
  const styles = AppStyles.getAllStyles(scheme);
  return (
    <View style={localStyles.noDataContainer}>

      <Image
        source={image ?? require('../../assets/images/no_data.png')}
        resizeMode='contain'
        style={localStyles.noDataImage}
      />

      {_getVerticalPadding(16)}

      <Text style={[styles.text_16_reg_mainTextColor2, { textAlign: 'center' }]}>{title}</Text>
      {_getVerticalPadding(4)}
      <Text style={styles.text_12_reg_dark3}>{desc}</Text>

    </View>
  );
}
const getLocalStyles = (colorSet) => {
  return StyleSheet.create({
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorSet.mainThemeBackgroundColor,
    },
    noDataImage: {
      width: widthPixel(140),
      height: heightPixel(110),
      marginBottom: heightPixel(16),
    },
    noDataText: {
      fontSize: heightPixel(16),
      color: '#888',
      fontFamily: AppStyles.fontFamily.semiBoldFont,
    },
  });
}

function formatRelative(utcString) {
  if (!utcString) return '';

  // Ensure it's interpreted as UTC
  const iso = utcString.match(/Z|[+-]\d{2}:\d{2}$/)
    ? utcString
    : utcString + 'Z';

  const dateUtc = new Date(iso);
  if (isNaN(dateUtc)) return utcString;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const target = new Date(dateUtc.getFullYear(), dateUtc.getMonth(), dateUtc.getDate());

  if (target.getTime() === today.getTime()) {
    return 'Today';
  }
  if (target.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  const diffTime = today.getTime() - target.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays > 1 && diffDays <= 7) {
    // Return weekday name
    return target.toLocaleDateString('en-IN', { weekday: 'long' });
  }

  // Otherwise return formatted date like "07/06/2019"
  return dateUtc.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
}

const formatTime = seconds =>
  Math.floor(seconds / 60) + ':' + ('0' + (seconds % 60)).slice(-2);

const key = "HIjx+1hrHpnONd8ZJBVZLdc756ikDmZU1vMuoBB8Xjh=";
const IV = 'B`RmFLS	]�PϮ��H'







function calculateBounds(center, radius = 500) {
  const EARTH_RADIUS = 6378137; // Earth's radius in meters
  const lat = center?.latitude;
  const lng = center?.longitude;

  // Convert latitude and longitude to radians
  const latRad = lat * Math.PI / 180;
  const lngRad = lng * Math.PI / 180;

  // Angular distance in radians
  const radDist = radius / EARTH_RADIUS;

  // Calculate latitude bounds
  const minLat = latRad - radDist;
  const maxLat = latRad + radDist;

  // Calculate longitude bounds
  const deltaLng = Math.asin(Math.sin(radDist) / Math.cos(latRad));
  const minLng = lngRad - deltaLng;
  const maxLng = lngRad + deltaLng;

  // Convert back to degrees
  return {
    northEast: {
      latitude: maxLat * 180 / Math.PI,
      longitude: maxLng * 180 / Math.PI
    },
    southWest: {
      latitude: minLat * 180 / Math.PI,
      longitude: minLng * 180 / Math.PI
    }
  };
}

const fetchCurrentLocation = async (tryEnableGPS = false) => {
  console.log("Attempting to fetch location...");

  try {
    const position = await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        resolve,
        reject,
        { enableHighAccuracy: false, timeout: 80000, maximumAge: 10000 }
      );
    });

    console.log("Current position:", position);

    if (!position?.coords) {
      throw new Error("Invalid position data received");
    }

    const locationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      latitudeDelta: 0.0050,
      longitudeDelta: 0.0050,
    };

    return {
      success: true,
      newPosition: locationData,
      error: null
    };

  } catch (error) {
    console.error("Location fetch failed:", error);

    let errorMessage = "Failed to get location";

    if (error.code) {
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage = "Location permission denied";
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = "Location unavailable";
          break;
        case 3: // TIMEOUT
          errorMessage = "Location request timed out";
          break;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    if (error.code === 2) {
      if (Platform.OS === 'android') {
        try {
          if (!tryEnableGPS) return;
          SecureStorage.setGPSEnablePopup('1');
          const ok = await LocationModule?.requestEnableGPS()
          console.log('GPS enabled:', ok);

          const position = await new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
              resolve,
              reject,
              { enableHighAccuracy: false, timeout: 80000, maximumAge: 10000 }
            );
          });

          if (!position?.coords) {
            throw new Error("Invalid position data received");
          }

          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0050,
            longitudeDelta: 0.0050,
          };

          return {
            success: true,
            newPosition: locationData,
            error: null
          };


        } catch (e) {
          console.warn('GPS not enabled', e)
        }
        return
      }
      Alert.alert("Unable to retrieve location",
        "GPS or location services are disabled or unavailable. Enable location services on your device",
        [
          {
            text: 'Open Settings',
            onPress: openGPSSettings,
          },
          {
            text: 'Cancel',
            onPress: null,
          },
        ]
      )
    }

    return {
      success: false,
      newPosition: null,
      error: errorMessage
    };
  }
};

function openGPSSettings() {
  if (Platform.OS === 'android') {
    // Opens the Android system location settings
    Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
  } else {
    // Opens the iOS Settings app (app-specific settings only)
    Linking.openURL('app-settings:');
  }
}

const checkBackgroundPermission = async () => {
  let permission;
  if (Platform.OS === 'ios') {
    permission = PERMISSIONS.IOS.LOCATION_ALWAYS;
  } else {
    permission = PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;
  }

  try {
    const status = await check(permission);

    return status === RESULTS.GRANTED
  }
  catch (error) {
    return false;
  }
}

const checkLocationPermission = async () => {
  let permission;
  if (Platform.OS === 'ios') {
    permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  } else {
    permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  }

  try {
    const status = await check(permission);

    return status === RESULTS.GRANTED
  }
  catch (error) {
    return false;
  }

}

const requestLocationPermission = async () => {
  let permission;
  if (Platform.OS === 'ios') {
    permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  } else {
    permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  }

  try {

    const requestStatus = await request(permission);
    if (requestStatus === RESULTS.GRANTED) {
      return true;
    }
  } catch (error) {
    console.warn('Error checking location permission:', error);
    return false;
  }
};

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // For Android 13+ (API level 33+)
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message:
                'App needs access to your notifications ' +
                'so you can receive important updates',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }
      // For Android <13, notification permission is granted by default
      return true;
    } catch (err) {
      console.error('Notification permission error:', err);
      return false;
    }
  }
  // For iOS (you'll need to implement iOS-specific logic)
  return false;

};

const processPins = (pins) => {
  return pins.map(pin => {
    // Handle both prefixed and raw base64 pins
    if (pin.startsWith('sha256/')) {
      return pin.substring(7); // Remove 'sha256/' prefix
    }
    return pin;
  }).filter(pin => pin.length === 44); // Ensure valid base64 length
};

const getHandleFromURL = (url) => {

  const lastSegment = url.match(/\/([^/]+)\/?$/)[1];
  return lastSegment
}

const HalfCircle = ({ color = '#F1F1F1', size = 100, direction = 'top' }) => {
  const containerStyle = {
    width: size,
    height: size / 2,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 25,
    zIndex: -1,
  };

  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  const getPosition = () => {
    switch (direction) {
      case 'top':
        return { top: 0 };
      case 'bottom':
        return { top: -size / 2 };
      case 'left':
        return {
          width: size / 2,
          height: size,
          left: 0,
        };
      case 'right':
        return {
          width: size / 2,
          height: size,
          left: -size / 2,
        };
      default:
        return { top: 0 };
    }
  };

  return (
    <View style={[containerStyle, direction === 'left' || direction === 'right' ?
      { width: size / 2, height: size } : { width: size, height: size / 2 }]}>
      <View style={[circleStyle, getPosition()]} />
    </View>
  );
};

const ITEM_SPACING = widthPixel(16); // space between items
const NUM_COLUMNS = 2;
const SIDE_MARGIN = widthPixel(16); // padding left/right
const ITEM_WIDTH = (DEVICE_WIDTH - SIDE_MARGIN * 2 - ITEM_SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;



const extactColorsFromVariants = (data) => {

  const variants = data.edges.map(edge => edge.node); // Extract nodes from edges

  const uniqueColorVariants = variants.reduce((acc, variant) => {
    const colorOption = variant?.selectedOptions.find(opt => opt.name === "Color");
    const color = colorOption?.value || "Default";

    // If this color hasn't been recorded yet, store its image
    if (!acc.some(item => item.color === color)) {
      acc.push({
        color,
        image: variant.image?.url,
        price: variant.price.amount,
        currency: variant.price.currencyCode,
        variantId: variant.id,
      });
    }
    return acc;
  }, []);

  return uniqueColorVariants;
}

const tagStyles = {
  h3: { fontSize: 18, fontWeight: '600', marginVertical: 4, fontFamily: 'Campton-Book' },
  strong: { fontFamily: 'Campton-SemiBold' },
  b: { fontFamily: 'Campton-bold' },
  p: { fontSize: 14, lineHeight: 20, fontFamily: 'Campton-Book' },
  ul: { paddingLeft: 16, marginVertical: 4, fontFamily: 'Campton-Book' },
  li: {
    fontSize: 14, marginBottom: 4, fontFamily: 'Campton-Book'
  },
  div: { marginVertical: 4 },
  hr: { marginVertical: 4, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  span: { fontSize: 14, fontFamily: 'Campton-Book' }
}

export {
  maskPhoneNumber, maskEmail, generateTokenFromUsernamePassword, getFileExtension,
  _getSeparator, getReadableDate, noDataView, formatRelative, formatTime,
  _getValidateText, getiOSPadding, checkBackgroundPermission,
  colors, handleLogout, HalfCircle,
  getTabIcon, calculateBounds, checkLocationPermission, requestLocationPermission,
  EMAIL_REGEX, fetchCurrentLocation,
  responseApiKeys, requestNotificationPermission,
  PASSWORD_REGX, processPins, extactColorsFromVariants,
  NUMBER_REGX, getHandleFromURL,
  checkKeys,
  _getHorizontalPadding,
  _getVerticalPadding,
  getRegionFromCoordinates,
  _getFilePicker,
  _getOldDate,
  DEVICE_WIDTH,
  DEVICE_HEIGHT, ITEM_SPACING, NUM_COLUMNS, SIDE_MARGIN, ITEM_WIDTH,
  _isEmpty,
  deleteFile,
  getAccessbility,
  getCameraIcon,
  getFirebaseToken,
  getDeviceInfo,
  callAPI,
  moveFile,
  getFormData,
  appendFilesFormData,
  COUNT_KEYS,
  toSentenceCase,
  downloadFile,
  deleteDirectory,
  createDirectory,
  isOnline,
  copyFile,
  debounceScanner,
  showAlert,
  sleep,
  debounce, tagStyles
};
