import React, { useEffect } from 'react';
import { DefaultTheme, NavigationContainer, useNavigation } from '@react-navigation/native';
import { Alert, Appearance, Linking, Platform, StatusBar, Text, useColorScheme, View } from 'react-native';
import RootNavigator from './navigators/RootNavigator';
import AppStyles from './styles/AppStyles';
import Constants from './utils/Constants';
import { _isEmpty, getFirebaseToken, requestNotificationPermission } from './utils/Helper';
import SecureStorage from './utils/SecureStorage';
import { useDispatch, useSelector } from 'react-redux';
import { setColorScheme } from './redux/reducers/appSlice';
import { initializeCart } from './redux/reducers/cartSlice';
import { SafeAreaView } from 'react-native-safe-area-context';



const AppContainer = () => {
  const { colorScheme, } = useSelector(state => state.app);
  const colorSet = AppStyles.colorSet[colorScheme];
  const dispatch = useDispatch();
  const appScheme = useColorScheme();

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colorSet?.primaryColor,      // tint color for active elements
      background: colorSet?.mainThemeBackgroundColor,   // screen background
    },
  };

  useEffect(() => {
    setColors();
    requestNotificationPermission();
    dispatch(initializeCart());
  }, [dispatch]);

  const setColors = () => {


    // SecureStorage.getScheme()
    //   .then(scheme => {
    //     console.log("LocalStorage.getScheme", scheme);
    let colorScheme;
    // if (!scheme) return;
    // if (scheme === 'system-default') {
    colorScheme = 'system-default-' + appScheme;
    // } else {
    //   colorScheme = scheme
    // }
    dispatch(setColorScheme(colorScheme));
    // })


  }



  const linking = {
    prefixes: ['https://agispares.com', 'http://agispares.com', 'agispares://'],
    config: {
      screens: {
        MainStack: {
          screens: {
            ProductDetails: 'products/:handle',
          },
        },
      },
    },
  };

  return (

    <View style={{ flex: 1, backgroundColor: '#000' }}>


      <SafeAreaView style={
        {
          flex: 1,
        }
      }>
        <NavigationContainer
          linking={linking}
          theme={MyTheme}
        >

          <RootNavigator />


        </NavigationContainer>

      </SafeAreaView>

    </View>

  );
};

export default AppContainer;
