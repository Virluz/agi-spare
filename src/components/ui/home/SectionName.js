import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { heightPixel, widthPixel } from '../../../utils/fonts'
import { useSelector } from 'react-redux';
import AppStyles from '../../../styles/AppStyles';

const SectionName = ({ title, width = 0, size = null }) => {

    const { colorScheme, } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);

    const colorSet = AppStyles.colorSet[colorScheme];

    return (
        <View style={[{
            // height: heightPixel(100), 
            // width: width ?? widthPixel(94),
            padding: widthPixel(10),
            // borderWidth: 1, borderColor: '#F2F2F2',
            backgroundColor: colorSet.mainThemeBackgroundColor,
            alignItems: 'center',
            justifyContent: 'center'
        }, width && { width }]}>

            <Text style={[styles.text_24_bold_primaryTwo, { textAlign: 'center', }, size && { fontSize: size }]} >

                {title}

            </Text>


        </View>
    )
}

export default SectionName

const styles = StyleSheet.create({})