import React from 'react'
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import { heightPixel, widthPixel } from '../../utils/fonts';

export const RadioButtons = ({ selected }) => {
    const { colorScheme } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme ?? 'light']
    const localStyles = getLocalStyles(colorSet);
    return (
        <>

            {selected ?
                <View
                    style={localStyles.radioButton}
                >

                    <View
                        style={localStyles.radioButtonInside}
                    />


                </View>

                :

                <View
                    style={localStyles.deselectedButton}
                />

            }

        </>

    )
}


const getLocalStyles = (colorSet) => {
    ;
    return StyleSheet.create({
        rowContainer: {
            padding: heightPixel(16),
            alignItems: 'center',
            borderRadius: heightPixel(12),
            borderWidth: 0.5,
            borderColor: colorSet.light,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        selectedStyle: {
            borderColor: colorSet.black,
            backgroundColor: colorSet.light2
        },
        radioButton: {
            height: widthPixel(16),
            width: widthPixel(16),
            borderRadius: widthPixel(8),
            backgroundColor: colorSet.primaryColor,
            alignItems: 'center',
            justifyContent: 'center'
        },
        radioButtonInside: {
            height: widthPixel(6),
            width: widthPixel(6),
            borderRadius: widthPixel(4),
            backgroundColor: colorSet.mainThemeBackgroundColor
        },
        deselectedButton: {
            height: widthPixel(16),
            width: widthPixel(16),
            borderWidth: 1.5,
            borderRadius: widthPixel(8),
            borderColor: colorSet.light
        }
    })
}