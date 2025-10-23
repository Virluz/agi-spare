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
import { getAccessbility } from '../../utils/Helper';
import Constants from '../../utils/Constants';
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';

export const SecondaryButton = ({ disabled, onPress, iconStyle, iconSource, title, loading }) => {
    const { colorScheme } = useSelector(state => state.app);

    const appStyles = AppStyles.getAllStyles(colorScheme);

    const styles = getStyles(colorScheme);
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

                        <ActivityIndicator animating={true} color={colorSet.black} size="small" />

                    </View>
                )}
                {(
                    <View style={loading && styles.lowOpacity}>
                        {iconSource && <Image style={iconStyle} source={iconSource} />}
                        <Text style={disabled ? appStyles.text_16_secondaryFont_dark8 : appStyles.text_16_reg_secondaryFont_mainTextColor2}>{title}</Text>
                    </View>
                )}
            </Ripple>

        </View>
    );
};

const getStyles = (colorScheme) => {
    return StyleSheet.create({
        mainContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },

        container: {
            height: heightPixel(35),
            width: '100%',
            alignSelf: 'center',
            backgroundColor: AppStyles.colorSet[colorScheme].static_white,
            alignItems: 'center',
            justifyContent: 'center',
            // borderRadius: widthPixel(12),
            borderColor: AppStyles.colorSet[colorScheme].primaryColor,

            borderWidth: 1,
            // elevation: 2,
            marginHorizontal: widthPixel(16),
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
