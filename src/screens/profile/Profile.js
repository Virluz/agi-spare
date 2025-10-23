import { Appearance, Linking, StyleSheet, Text, useColorScheme, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import SecureStorage from '../../utils/SecureStorage'
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native'
import { changeLanguage, IMLocalized } from '../../service/i18n.config'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { _getVerticalPadding, generateTokenFromUsernamePassword, getDeviceInfo, getFirebaseToken, handleLogout, sleep } from '../../utils/Helper'
import AppStyles from '../../styles/AppStyles'
import Toolbar from '../../components/ui/Toolbar'
import ProfileCard from '../../components/ui/ProfileCard'
import { heightPixel, widthPixel } from '../../utils/fonts'
import { ChevronRight } from 'lucide-react-native'
import Ripple from 'react-native-material-ripple';
import { setAuthorizationHeader } from '../../api/config'
import { openSettings } from 'react-native-permissions'
import Loader from '../../widgets/Loader'
import AlertModel from '../../components/models/AlertModel'
import { getLocationTrackingSetting, updateFirebaseToken } from '../../api/requests'

const colorModes = [
    {
        name: 'Light',
        id: 1,
        api_id: 'light',
    },
    {
        name: 'Dark',
        id: 2,
        api_id: 'dark',

    },
    {
        name: 'System Default',
        id: 3,
        api_id: 'system-default',
    }
]

const Profile = () => {
    const { colorScheme, appSettings, apiCredentials } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setshowConfirmation] = useState(false);

    const styles = AppStyles.getAllStyles(colorScheme);

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const navigation = useNavigation();

    const handleLogoutFunction = async () => {
        return;
        setLoading(true);
        handleLogout();
        SecureStorage.setShowAllTimePopup('0');
        SecureStorage.setGPSEnablePopup('0');
        setLoading(false);
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'OnboardStack' }],
            }),
        );
        setshowConfirmation(false)
    }
    const dispatch = useDispatch();


    const translateKeys = {
        Profile: IMLocalized('Profile'),
        select_color: IMLocalized('Select App Theme'),
    }

    const onLanguageChange = () => {
        changeLanguage('MR')
    }

    const getMenuButton = (title, onPress) => {
        return (
            <Ripple style={{
                marginTop: heightPixel(8),
                height: heightPixel(56), borderRadius: widthPixel(12),
                borderWidth: 0.5, borderColor: '#C5C6CC', alignItems: 'center',
                justifyContent: 'space-between', flexDirection: 'row',
                paddingHorizontal: widthPixel(16)
            }} onPress={onPress}>

                <Text style={styles.text_14_bold_mainTextColor2}>

                    {title}

                </Text>

                <ChevronRight color={colorSet.black} />

            </Ripple>
        )
    }

    const openAppSettings = () => {
        openSettings().catch((error) => console.log("error", error));
    }

    useFocusEffect(useCallback(() => {
        handleUpdateFirebaseToken();
    }, []));



    const handleUpdateFirebaseToken = async () => {
        try {
            const deviceInfo = await getDeviceInfo();
            const fcmToken = await getFirebaseToken();

            const payload = {
                "MobileRecipientId": apiCredentials?.username,
                "PushNotificationId": fcmToken,
                "DeviceInfo": deviceInfo
            }
            const response = await updateFirebaseToken(payload);
        } catch (error) {
            console.log("ERror");
        }
    }

    return (
        <>

            {loading && <Loader />}

            <Toolbar isBottomTab={true} title={"Settings"} />
            {
                <View style={styles.container}>

                    <ProfileCard />


                    {getMenuButton('Privacy Policy', () => {
                        console.log("clicked Privacy");
                        navigation.navigate('Privacy')
                    })}

                    {appSettings?.IsAutoLocationTrackingEnabled && getMenuButton('App Location Settings', () => {
                        openAppSettings();
                    })}



                    <PrimaryButton title={"Logout"} onPress={setshowConfirmation} color={colorSet.black} />



                </View>
            }

            {showConfirmation &&
                <AlertModel
                    onPress={handleLogoutFunction}
                    title={"Logout"}
                    description={"Are you sure you want to logout ?"}
                    onCancel={() => setshowConfirmation(false)}
                />
            }
        </>

    )


}

export default Profile
