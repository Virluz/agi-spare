import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert, AppState, BackHandler, Button, DeviceEventEmitter, Image, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, PushNotificationIOS, Text, useColorScheme, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SecureStorage from '../utils/SecureStorage';
import Constants from '../utils/Constants';
import Loader from '../widgets/Loader';
import { initializeI18n } from '../service/i18n.config';
import { BottomTabs } from './BottomTabs';
import DrawerNavigator from './DrawerNavigator';
import { setAuthorizationHeader, setAxiosBaseUrl } from '../api/config';
import eventBus from '../service/EventBus';
import { _getVerticalPadding, _isEmpty, checkLocationPermission, fetchCurrentLocation, generateTokenFromUsernamePassword, getDeviceInfo, handleLogout, processPins, requestLocationPermission, sleep } from '../utils/Helper';
import { useDispatch, useSelector } from 'react-redux';
import { showErrorMsg } from '../widgets/FlashMessages';
import { isDeviceRooted } from 'react-native-detect-frida';
import DeviceInfo from 'react-native-device-info';
import Shield from '../components/functions/Shield';
import RNBootSplash from 'react-native-bootsplash';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import AppStyles from '../styles/AppStyles';
import { heightPixel, widthPixel } from '../utils/fonts';
import PermissionPage from '../components/ui/PermissionPage';
import { getPins, setNotificationStatus } from '../api/requests';
import { getMessaging } from '@react-native-firebase/messaging';
import { NotificationModel } from '../components/models/NotificationModel';
import ProductDetails from '../screens/product/ProductDetails';
import ProductList from '../screens/product/ProductList';
import AccountContainer from './AccountContainer';
import OnboardCarousel from '../screens/profile/OnboardCarousel';
import { loadWishlistFromStorage } from '../utils/wishlistStorage';
import { setWishlistItems } from '../redux/reducers/wishlistSlice';
import SignUp from '../screens/auth/SignUp';
import Login from '../screens/auth/Login';
import CreateAccount from '../screens/auth/CreateAccount';
import MainNavigator from './MainNavigator';
import LoginWithOtpScreen from '../screens/LoginWithOtpScreen';
import EmailPasswordLogin from '../screens/auth/EmailPasswordLogin';
import { isAuthenticated } from '../utils/customerAuth';
import { setIsLoggedIn } from '../redux/reducers/appSlice';
const Root = createStackNavigator();

export default RootNavigator = () => {
  const [showNotification, setShowNotification] = React.useState({});
  const navigation = useNavigation();

  getMessaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    callDeliveredApi(remoteMessage?.data?.IncidentTrackingLogId);

  });
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);
  const dispatch = useDispatch();
  const [showPermissionPopup, setShowPermissoinPopup] = useState(false);
  const { colorScheme, appSettings, isLoggedInGlobal, apiCredentials } = useSelector(state => state.app);
  const styles = AppStyles.getAllStyles(colorScheme);
  const [pendingNotificationId, setPendingNotificationId] = useState(null);
  useEffect(() => {

    const init = async () => {
      // ... initialization code


      const authenticated = await isAuthenticated();

      dispatch(setIsLoggedIn(authenticated));
      await RNBootSplash.hide({ fade: true });
    };

    init();
  }, []);

  useEffect(() => {
    const decideStart = async () => {
      const seen = await SecureStorage.getHasSeenOnboard();
      setInitialRoute(seen ? 'MainStack' : 'OnboardCarousel');
      setLoading(false);
    };
    decideStart();

    const unsubscribeLogin = eventBus.subscribe('session_expired', () => {
      // console.log('session_expired:');
      showErrorMsg("Session has been expired! Please login again!");
      handleLogout();
      SecureStorage.clear();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'OnboardStack' }],
        }),
      );
    });


    return () => {
      unsubscribeLogin();
    }

  }, []);


  useEffect(() => {
    const unsubscribe = getMessaging().onMessage(async remoteMessage => {
      if (remoteMessage) {

        const data = {
          title: remoteMessage?.notification?.title,
          desc: remoteMessage?.notification?.body,
          IncidentTrackingLogId: remoteMessage?.data?.IncidentTrackingLogId
        }
        // triggerLocalNotification(
        //   data.title,
        //   data.desc
        // );
        setShowNotification(data);
        callDeliveredApi(remoteMessage?.data?.IncidentTrackingLogId);
      }
      console.log("onMessage", remoteMessage)

    });

    const unsubsribeClick = getMessaging().onNotificationOpenedApp(
      async remoteMessage => {
        if (remoteMessage) {
          handleRedirection(remoteMessage?.data?.IncidentTrackingLogId);
        }

        // console.log("onNotificationOpenedApp", remoteMessage)


      },
    );

    const unsubsribeInitial = getMessaging().getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          callDeliveredApi(remoteMessage?.data?.IncidentTrackingLogId);
          handleRedirection(remoteMessage?.data?.IncidentTrackingLogId);
        }
      });


    return () => {
      unsubscribe;
      unsubsribeClick;
      unsubsribeInitial;
    };
  }, [])


  useEffect(() => {
    loadWishlistFromStorage().then(items => {
      dispatch(setWishlistItems(items));
    });
  }, []);


  const handleRedirection = async (IncidentTrackingLogId) => {
    try {

      await sleep(300);
      var tempNav = navigation;
      if (!navigation) { tempNav = useNavigation(); }
      if (IncidentTrackingLogId) {
        tempNav.navigate('NoficationDetail', {
          IncidentTrackingLogId: IncidentTrackingLogId,
          // onGoBack: () => callApi()
        });


      } else {
        tempNav.navigate('Home');
        showErrorMsg("Notification not found");
      }
    } catch {
    }
  }


  const PermissionPageWrapper = ({ navigation }) => (
    <PermissionPage
      onClose={() => {
        setShowPermissoinPopup(false);
      }}
    />
  );

  if (loading || !initialRoute) return <Loader />;

  return (
    <>
      <Root.Navigator
        screenOptions={{
          headerShown: false, animationEnabled: false,

        }}

        initialRouteName={initialRoute}
      >
        <>
          <Root.Screen
            name="MainStack"
            component={(showPermissionPopup && appSettings?.IsAutoLocationTrackingEnabled) ? PermissionPageWrapper : MainNavigator}
            options={{
              animationEnabled: false,
              // headerTitle: 'Main Stack',
              headerLeft: () => <Button title="Back" onPress={() => navigation.goBack()} />,
            }}

          />

          <Root.Screen
            options={{ headerShown: false, tabBarStyle: { display: 'none' } }}
            name="OnboardCarousel"
            component={OnboardCarousel}
          />

          <Root.Screen
            options={{ headerShown: false, tabBarStyle: { display: 'none' } }}
            name="Login"
            component={EmailPasswordLogin}
          />

          {/* Keep OTP login available under a separate route for future use */}
          <Root.Screen
            options={{ headerShown: false, tabBarStyle: { display: 'none' } }}
            name="LoginOtp"
            component={LoginWithOtpScreen}
          />

          <Root.Screen
            options={{ headerShown: false, tabBarStyle: { display: 'none' } }}
            name="CreateAccount"
            component={CreateAccount}
          />
        </>
      </Root.Navigator>

      {!_isEmpty(showNotification) &&
        <NotificationModel
          title={showNotification?.title}
          description={showNotification?.desc}
          onPress={() => {

            handleRedirection(showNotification?.IncidentTrackingLogId);

            setShowNotification({})


          }}
        />
      }
    </>

  );
};
