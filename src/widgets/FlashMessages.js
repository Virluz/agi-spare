import { hideMessage, showMessage } from 'react-native-flash-message';
import AppStyles from '../styles/AppStyles';
import fonts, { heightPixel, widthPixel } from '../utils/fonts';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native';


const CustomToastContent = ({ message, onPress, buttonLabel }) => {
  return (
    <View style={styles.customContent}>
      <Text style={styles.messageText} numberOfLines={2}>
        {message}
      </Text>
      {onPress && (
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const showSuccessMsgWithButton = (
  msgStr,
  options = {},
  ref = null,
  onButtonPress = null,
  buttonLabel = 'UNDO'
) => {
  const toastProps = {
    message: ' ', // Required, but hidden using titleStyle
    type: 'success',
    position: 'bottom',
    floating: true,
    duration: 5000,
    style: styles.toastContainer,
    containerStyle: styles.toastWrapper,
    titleStyle: { height: 0, opacity: 0 }, // Hides default message
    renderCustomContent: () => (
      <CustomToastContent
        message={msgStr}
        onPress={() => {
          onButtonPress();
          hideMessage();
        }
        }
        buttonLabel={buttonLabel}
      />
    ),
    ...options,
  };

  if (ref?.current?.showMessage) {
    ref.current.showMessage(toastProps);
  } else {
    showMessage(toastProps);
  }
};

export const showSuccessMsg = (msgStr, options = {}, ref = null) => {
  if (ref) {
    ref?.current?.showMessage({
      message: msgStr,
      type: 'success',
      style: styles.sucessfullToastcontainer,
      titleStyle: styles.titleStyle,
      position: 'top',
      floating: true,
      // icon: props => <Image style={{ height: widthPixel(22), width: widthPixel(22) }} source={require("../assets/check.png")} />,
      ...options
    })
  }
  showMessage({
    message: msgStr,
    type: 'success',
    style: styles.sucessfullToastcontainer,
    titleStyle: styles.titleStyle,
    position: 'top',
    floating: true,
    // icon: props => <Image style={{ height: widthPixel(22), width: widthPixel(22) }} source={require("../assets/check.png")} />,
    ...options
  });
}

export const showErrorMsg = (msgStr, options = {}, ref = null) => {
  if (ref) {
    ref?.current?.showMessage({
      message: msgStr,
      type: 'danger',
      style: styles.UnsuccesfulToastcontainer,
      titleStyle: styles.titleStyle,
      floating: true,
      position: 'top',
      // icon: props => <Image style={{ height: widthPixel(22), width: widthPixel(22) }} source={require("../assets/fail.png")} />,
      ...options
    });
    return;
  }
  showMessage({
    message: msgStr,
    type: 'danger',
    style: styles.UnsuccesfulToastcontainer,
    titleStyle: styles.titleStyle,
    floating: true,
    position: 'top',
    // icon: props => <Image style={{ height: widthPixel(22), width: widthPixel(22) }} source={require("../assets/fail.png")} />,
    ...options
  });
}

export const showWarningMsg = (msgStr, options = {}, ref = null) => {
  if (ref) {
    ref?.current?.showMessage({
      message: msgStr,
      type: 'warning',
      position: 'top',
      style: styles.container,
      floating: true,
      titleStyle: styles.titleStyle,
      ...options

    })
    return;
  }
  showMessage({
    message: msgStr,
    type: 'warning',
    position: 'top',
    style: styles.container,
    floating: true,
    titleStyle: styles.titleStyle,
    ...options
  });

}
const styles = StyleSheet.create({
  container: {
    backgroundColor: AppStyles.colorSet['light'].darkGreen,
    borderRadius: 30,
    top: heightPixel(72)

  },
  sucessfullToastcontainer: {
    backgroundColor: AppStyles.colorSet['light'].darkGreen,
    borderRadius: 30,
    width: '70%',
    top: heightPixel(72),
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  UnsuccesfulToastcontainer: {
    backgroundColor: AppStyles.colorSet['light'].red1,
    borderRadius: 30,
    width: '70%',
    top: heightPixel(72),
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },

  warnign: {

  },
  titleStyle: {
    color: '#fff',
    fontSize: fonts._12,
    fontWeight: '400',
    textAlign: 'center'
  },
  toastWrapper: {
    paddingVertical: 0,
    marginVertical: 0,
    minHeight: 0,
  },
  toastContainer: {
    borderRadius: 10,
    marginBottom: 40,
    marginHorizontal: 20,
    backgroundColor: '#121212',
    minHeight: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  customContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingVertical: widthPixel(8),
    flexWrap: 'wrap',
  },
  messageText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
    maxWidth: '80%',
  },
  button: {
    // paddingHorizontal: 12,
    padding: widthPixel(14),
    backgroundColor: '#ffffff30',
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
