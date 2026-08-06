/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import AppVersionCheckService from './src/service/AppVersionCheck';

import AppContainer from './src/AppContainer';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initializeI18n } from './src/service/i18n.config';
import { Provider, useDispatch } from 'react-redux';
import { getFirebaseToken } from './src/utils/Helper';
import FlashMessage from 'react-native-flash-message';
import Shield from './src/components/functions/Shield';
import DeviceInfo from 'react-native-device-info';
import store from './src/redux/store';
import ForceUpdateConfig, { logUpdate } from './src/config/ForceUpdateConfig';
import ForceUpdateModal from './src/components/ForceUpdateModal';



function App(): React.JSX.Element {


  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
  };

  const [updateInfo, setUpdateInfo] = useState({
    showUpdateModal: false,
    currentVersion: '',
    latestVersion: '',
    storeUrl: '',
  });

  console.log('App rendered');



  useEffect(() => {
    initializeI18n();

    checkForAppUpdate();

    getFirebaseToken();

    return () => {
      // Cleanup if necessary
    }

  }, [])

  const handleUpdatePress = () => {
    // Keep modal open as it's a force update
    console.log('User pressed update button');
  };


  const checkForAppUpdate = async () => {
    // Check if feature is enabled
    if (!ForceUpdateConfig.ENABLED) {
      logUpdate('Force update feature is disabled');
      return;
    }

    try {
      // Wait a bit for app to fully load before checking
      setTimeout(async () => {
        logUpdate('Starting version check...');

        const updateData = ForceUpdateConfig.CUSTOM_API_URL
          ? await AppVersionCheckService?.checkForUpdateFromAPI(ForceUpdateConfig.CUSTOM_API_URL)
          : await AppVersionCheckService?.checkForUpdate();

        if (updateData?.needsUpdate || updateData?.forceUpdate) {
          logUpdate('Update required', updateData);
          setUpdateInfo({
            showUpdateModal: true,
            currentVersion: updateData?.currentVersion || AppVersionCheckService?.getCurrentVersion(),
            latestVersion: updateData?.latestVersion,
            storeUrl: updateData?.storeUrl,
          });
        } else {
          logUpdate('App is up to date');
        }
      }, ForceUpdateConfig.CHECK_DELAY);
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

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

        {/* <ForceUpdateModal
          visible={updateInfo.showUpdateModal}
          currentVersion={updateInfo.currentVersion}
          latestVersion={updateInfo.latestVersion}
          storeUrl={updateInfo.storeUrl}
          onUpdate={handleUpdatePress}
        /> */}
        {/* </SafeAreaView> */}
      </Provider>
    </SafeAreaProvider>
  );
}


export default App;
