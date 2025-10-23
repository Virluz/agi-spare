import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppStyles from '../../styles/AppStyles'
import { useSelector } from 'react-redux';
import SecureStorage from '../../utils/SecureStorage';
import { _getVerticalPadding } from '../../utils/Helper';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { useTranslation } from 'react-i18next';

const ProfileCard = () => {

    const { colorScheme } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme ?? 'light'];
    const localStyles = getLocalStyles(colorSet);
    const [loading, setLoading] = useState(false);

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        SecureStorage.getUserData()
            .then(data => {
                if (!data) {
                    setLoading(false);
                    return;
                }
                console.log('DATA ROOT NAVIGATOR', data);
                setUserData(data);
                setLoading(false);
            })
    }, [])

    const { t } = useTranslation();


    const translateKeys = {
        welcome: t('Welcome! Just a quick check.'),
        to_ensure: t('To ensure you receive the right alerts, please confirm your details before accessing the app.'),
        continue: t('Contine'),
        mobile_number: t('Mobile Number:'),
        email: t('Email:'),
        get_started: t('Get started'),
        not_you: t('Not you?')
    }


    return (
        <View style={localStyles.cardContainer}>

            <View style={localStyles.rowContainer}>


                <Image
                    resizeMode='contain'
                    source={require('../../../assets/images/user.png')} style={localStyles.userImage} />


                <View style={localStyles.companyNameContainer}>

                    <Text style={styles.text_10_bold_static_white}>
                        {userData?.RecipientModel?.ClientName?.toUpperCase()}
                    </Text>
                </View>


            </View>

            {_getVerticalPadding(16)}

            <Text style={styles.text_24_semi_static_white}>

                {userData?.RecipientModel?.FirstName} {userData?.RecipientModel?.LastName}
            </Text>

            {_getVerticalPadding(8)}

            <Text style={styles.text_14_reg_static_white}>

                {translateKeys.mobile_number} {userData?.RecipientModel?.MobileNumber ? "+" + userData?.RecipientModel?.MobileNumber : ' -'}

            </Text>

            <Text style={styles.text_14_reg_static_white}>

                {translateKeys.email} {userData?.RecipientModel?.Email ? userData?.RecipientModel?.Email : ' -'}

            </Text>



        </View>

    )
}

export default ProfileCard

const getLocalStyles = (colorSet) => {
    return StyleSheet.create({
        cardContainer: {
            height: 'auto', width: '100%', alignSelf: 'center',
            backgroundColor: colorSet.primaryColor, padding: heightPixel(12),
            borderRadius: widthPixel(20)
        },
        rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
        userImage: { height: heightPixel(64), width: heightPixel(64), },
        companyNameContainer: {
            height: heightPixel(30), paddingHorizontal: widthPixel(8),
            // width: widthPixel(90),
            alignItems: 'center', justifyContent: 'center',
            borderRadius: 80, borderWidth: 1, borderColor: 'white',
            flexShrink: 1,
        }
    })
}