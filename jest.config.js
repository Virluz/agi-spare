module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-google-signin|@react-native-firebase|@d11/react-native-fast-image)/)'
  ],
};
