import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ripple from 'react-native-material-ripple';
import fonts, { heightPixel, widthPixel } from '../../utils/fonts';
import { _getHorizontalPadding, getAccessbility } from '../../utils/Helper';
import Constants from '../../utils/Constants';
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';

export const PrimaryButton = ({ disabled, onPress, fullWidth, iconSource, title, loading, color, showNextArrows = false }) => {
  const { colorScheme } = useSelector(state => state.app);

  const appStyles = AppStyles.getAllStyles(colorScheme);

  const styles = getStyles(colorScheme, color, disabled, fullWidth);
  const colorSet = AppStyles.colorSet[colorScheme];

  const accessbility = getAccessbility(
    title,
    Constants.ACESSBILITY_LABEL.BUTTON,
  );

  return (
    <View style={styles.mainContainer}>
      <Ripple
        accessibilityLabel={accessbility.label}
        disabled={disabled || loading}
        onPress={onPress}
        style={styles.container}>
        {loading && (
          <View style={styles.loader}>

            <ActivityIndicator animating={true} color={colorSet.white} size="small" />

          </View>
        )}

        {(
          <View style={[{
            flexDirection: 'row', gap: widthPixel(10), justifyContent: 'center',

          }, loading && styles.lowOpacity]}>

            <Text style={disabled ? appStyles.text_16_reg_secondaryFont : appStyles.text_16_reg_secondaryFont}>{title}</Text>

            {iconSource && <>
              {_getHorizontalPadding(8)}
              {iconSource}
            </>}

            {false &&

              <Image
                source={require('../../../assets/images/next_arrows.png')}
                style={{ height: 18, width: 18 }}
              />
            }

          </View>
        )}
      </Ripple>
    </View>
  );
};

const getStyles = (colorScheme, color, disabled, fullWidth) => {
  const backgroundColor = color ? color : disabled ? AppStyles.colorSet[colorScheme].dark7 : AppStyles.colorSet[colorScheme].primaryColor
  return StyleSheet.create({
    mainContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    container: {
      margin: fonts._10,
      height: heightPixel(35),
      width: fullWidth ? '100%' : 'auto',
      paddingHorizontal: widthPixel(16),
      borderRadius: widthPixel(100),
      // paddingHorizontal: widthPixel(32),
      alignSelf: 'center',
      backgroundColor: backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      // borderRadius: widthPixel(12),
      // elevation: 6,
    },
    footerTitle: {
      fontSize: fonts._14,
      color: AppStyles.colorSet[colorScheme].buttonText,
      fontFamily: AppStyles.fontFamily.semiBoldFont,
      // textTransform: 'uppercase'
    },
    loader: { position: 'absolute' },
    lowOpacity: { opacity: 0.3 }
  });
};
