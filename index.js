/**
 * @format
 */

import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getMessaging } from '@react-native-firebase/messaging';


Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Text.defaultProps.style = { fontFamily: 'Poppins-Regular', ...(Text.defaultProps.style || {}) };

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
TextInput.defaultProps.style = { fontFamily: 'Poppins-Regular', ...(TextInput.defaultProps.style || {}) };

// Must be registered before the React component tree is mounted so iOS can
// process data-only messages while the app is in the background or terminated.
getMessaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background:', remoteMessage.messageId);
});

AppRegistry.registerComponent(appName, () => App);
