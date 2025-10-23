import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { _getVerticalPadding, fetchCurrentLocation, requestLocationPermission } from '../../utils/Helper'
import { heightPixel, widthPixel } from '../../utils/fonts'
import AppStyles from '../../styles/AppStyles'
import { useDispatch, useSelector } from 'react-redux'
import { PrimaryButton } from './PrimaryButton'
import { openSettings } from 'react-native-permissions'

const PermissionPage = ({ onClose }) => {
    const { colorScheme, appSettings, isLoggedInGlobal } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);
    const dispatch = useDispatch();



    return (
        <>
            <View style={[styles.container,]}>

                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>

                    {_getVerticalPadding()}

                    <Text style={styles.text_28_bold_mainThemeForegroundColor}>

                        {'Your location is off.'}

                    </Text>

                    {_getVerticalPadding(72)}


                    {_getVerticalPadding(72)}

                    <Text style={[styles.text_14_reg_mainTextColor2, { textAlign: 'center' }]}>

                        {'Turn on location to receive area-specific emergency alerts, stay protected during local crises, and get timely guidance when it matters most.'}

                    </Text>

                </View>


                <View style={styles.whiteBackgroundContainer}>
                    <PrimaryButton title={'Enable Location'} />
                </View>


            </View>

        </>

    )
}

export default PermissionPage

const styles = StyleSheet.create({})