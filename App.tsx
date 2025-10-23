/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';


import AppContainer from './src/AppContainer';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initializeI18n } from './src/service/i18n.config';
import { Provider, useDispatch } from 'react-redux';
import { getFirebaseToken } from './src/utils/Helper';
import FlashMessage from 'react-native-flash-message';
import Shield from './src/components/functions/Shield';
import DeviceInfo from 'react-native-device-info';
import store from './src/redux/store';



function App(): React.JSX.Element {


  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
  };

  console.log('App rendered');



  useEffect(() => {
    initializeI18n();

    getFirebaseToken();

    return () => {
      // Cleanup if necessary
    }

  }, [])


  return (
    <SafeAreaProvider>

      <Provider store={store}>
        {/* <SafeAreaView style={
          {
            flex: 1,
          }
        }> */}

        <StatusBar
          // barStyle={isDarkMode ? "light-content" : "dark-content"}
          hidden={false}
        // backgroundColor="#144B85"
        />


        <AppContainer />
        <FlashMessage />
        {/* </SafeAreaView> */}
      </Provider>
    </SafeAreaProvider>
  );
}


export default App;
