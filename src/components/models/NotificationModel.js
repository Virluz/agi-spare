import React from 'react'
import ModelContainer from './ModelContainer'
import { Image, Modal, StyleSheet, Text, TouchableWithoutFeedback, View, useColorScheme } from 'react-native'
import { _getVerticalPadding, DEVICE_WIDTH } from '../../utils/Helper'
import { heightPixel, widthPixel } from '../../utils/fonts'
import { Dot } from '../Dot'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import AppStyles from '../../styles/AppStyles'
import { PrimaryButton } from '../ui/PrimaryButton'

export const NotificationModel = ({ onPress, title, description }) => {
    const { colorScheme } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme ?? 'light'];

    const { t } = useTranslation();

    const translateKeys = {
        Okay: t('Okay'),
    }

    const styles = AppStyles.getAllStyles(colorScheme);
    const localStyle = getLocalStyles(colorSet);

    const getChildComponent = () => {
        return (
            <View style={{
                alignItems: 'center'
            }}>

                {_getVerticalPadding(16)}


                <Text style={[styles.text_24_bold_mainTextColor2, { textAlign: 'center' }]}>

                    {title}

                </Text>

                {_getVerticalPadding(8)}

                <Text style={[styles.text_16_reg_dark4, { textAlign: 'center' }]}>

                    {description}

                </Text>

                {_getVerticalPadding(40)}

                <View style={localStyle.buttonContainer}>

                    <PrimaryButton
                        title={'Open'}
                        onPress={onPress}
                    />

                </View>


            </View>
        )
    }

    return (
        <Modal
            animationType="fade"
            transparent
            visible
            backdropColor={'#000'}
            onRequestClose={onPress}
            onDismiss={() => {
                // setModalVisible(true);
            }}
        >
            <TouchableWithoutFeedback onPress={onPress}>

                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    justifyContent: "center",
                    alignItems: "center",
                    // marginBottom: heightPixel(56)
                }}>

                    <View style={{
                        backgroundColor: colorSet.mainThemeBackgroundColor,
                        borderRadius: 16,
                        width: widthPixel(327),
                        // padding: widthPixel(16),
                        alignItems: "center",
                        elevation: 5,
                    }}>



                        {getChildComponent()}

                    </View>

                </View>
            </TouchableWithoutFeedback>

        </Modal>
    )
}

const getLocalStyles = (colorSet) => {
    return StyleSheet.create({
        iconMain: {
            paddingHorizontal: widthPixel(8),
            paddingVertical: heightPixel(4),
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colorSet.light2,
            marginLeft: widthPixel(13),
            borderRadius: widthPixel(100)
        },
        paymentImg: {
            width: widthPixel(16),
            height: heightPixel(16),
            marginLeft: widthPixel(4)
        },
        card: {
            borderRadius: widthPixel(16),
            backgroundColor: 'rgba(225, 67, 69, 0.13)',
            width: DEVICE_WIDTH - widthPixel(80),
            padding: widthPixel(16)
        },
        typeContainer: {
            paddingVertical: heightPixel(6),
            paddingHorizontal: widthPixel(8),
            borderWidth: 1, borderRadius: widthPixel(12)
        },
        buttonContainer: { width: DEVICE_WIDTH - widthPixel(80), },
        centerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
    })
}
