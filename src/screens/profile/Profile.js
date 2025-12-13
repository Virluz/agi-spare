import { Appearance, Image, Linking, ScrollView, StyleSheet, Switch, Text, useColorScheme, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import SecureStorage from '../../utils/SecureStorage'
import { CommonActions, useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native'
import { changeLanguage, IMLocalized } from '../../service/i18n.config'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { _getVerticalPadding, generateTokenFromUsernamePassword, getDeviceInfo, getFirebaseToken, handleLogout, sleep } from '../../utils/Helper'
import AppStyles from '../../styles/AppStyles'
import Toolbar from '../../components/ui/Toolbar'
import ProfileCard from '../../components/ui/ProfileCard'
import { heightPixel, widthPixel } from '../../utils/fonts'
import Ripple from 'react-native-material-ripple';
import { setAuthorizationHeader } from '../../api/config'
import { openSettings } from 'react-native-permissions'
import Loader from '../../widgets/Loader'
import AlertModel from '../../components/models/AlertModel'
import { getLocationTrackingSetting, updateFirebaseToken } from '../../api/requests'
import { Bell, ChevronRight, LogOut, Phone, Shield, User2, Wrench, Info, RotateCcw } from 'lucide-react-native'
import { clearAuthToken } from '../../utils/customerAuth'
import { setIsLoggedIn } from '../../redux/reducers/appSlice'
import { checkCustomerAuth } from '../../graphql/customerAuth'

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
    const { colorScheme, appSettings, apiCredentials, isLoggedInGlobal } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setshowConfirmation] = useState(false);
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [customerData, setCustomerData] = useState(null);

    const styles = AppStyles.getAllStyles(colorScheme);
    const isFocused = useIsFocused();

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const navigation = useNavigation();

    const handleLogoutFunction = async () => {
        try {
            await clearAuthToken();
            dispatch(setIsLoggedIn(false));
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
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





    useFocusEffect(useCallback(() => {
        handleUpdateFirebaseToken();
    }, []));


    useEffect(() => {

        checkAuthStatus();
    }, [isFocused]);

    const checkAuthStatus = async () => {
        try {
            const customer = await checkCustomerAuth();
            setCustomerData(customer);
        } catch (error) {
            console.error('Auth check failed:', error);
            setCustomerData(null);
        }
    };


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

    if (!isLoggedInGlobal) {

        return (
            <View style={styles.containerCenter}>

                <PrimaryButton

                    title={"Go To Login"}
                    onPress={() => navigation.navigate('Login')}
                />

                <Text style={styles.text_18_bold_mainTextColor2}>

                    Please log in to view your profile.

                </Text>


            </View>
        )
    }

    return (
        <>
            {loading && <Loader />}

            <View style={{ flex: 1, backgroundColor: '#0F1A2A' }}>
                {/* Header with avatar */}
                <View style={{ paddingTop: heightPixel(24), paddingBottom: heightPixel(20), alignItems: 'center' }}>
                    <View style={{ width: 96, height: 96, borderRadius: 48, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' }}>
                        <Image
                            source={require('../../../assets/images/user.png')}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    </View>
                    <Text style={[styles.text_18_bold_white, { marginTop: 10 }]}>{`${customerData?.firstName} ${customerData?.lastName}`}</Text>
                    <Text style={[styles.text_12_reg_mainTextColor3, { opacity: 0.9 }]}>{customerData?.email}</Text>
                </View>

                {/* White sheet with sections */}
                <View style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                        <View style={{ paddingHorizontal: widthPixel(16), paddingTop: heightPixel(16) }}>
                            {/* Account section */}
                            <Text style={styles.text_16_bold_mainTextColor2}>Account</Text>
                            <View style={s.card}>
                                <RowItem icon={<User2 size={18} color={colorSet.dark3} />} title="Edit profile" onPress={() => { navigation.navigate("EditProfile") }} />
                                <RowItem icon={<User2 size={18} color={colorSet.dark3} />} title="My Orders" onPress={() => { navigation.navigate("MyOrders") }} />
                                <RowItem
                                    icon={<Bell size={18} color={colorSet.dark3} />}
                                    title="Notifications"
                                    right={<Switch value={notifEnabled} onValueChange={setNotifEnabled} />}
                                />
                                <RowItem icon={<Wrench size={18} color={colorSet.dark3} />} title="Services" onPress={() => { navigation.navigate("WebViewScreen", { url: 'https://www.agispares.com/service', title: 'Services' }) }} />
                            </View>

                            {/* Help & Support section */}
                            <Text style={[styles.text_16_bold_mainTextColor2, { marginTop: 20 }]}>Help & Support</Text>
                            <View style={s.card}>
                                <RowItem icon={<Phone size={18} color={colorSet.dark3} />} title="Contact Us" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://www.agispares.com/contact', title: 'Contact Us' }) }} />
                                <RowItem icon={<Shield size={18} color={colorSet.dark3} />} title="Disclaimer" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://www.agispares.com/disclaimer', title: 'Disclaimer' }) }} />
                                <RowItem icon={<RotateCcw size={18} color={colorSet.dark3} />} title="Return Policy" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://www.agispares.com/return', title: 'Return Policy' }) }} />
                                <RowItem icon={<RotateCcw size={18} color={colorSet.dark3} />} title="Return Policy" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://www.agispares.com/return', title: 'Return Policy' }) }} />
                                <RowItem icon={<Info size={18} color={colorSet.dark3} />} title="About Us" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://www.agispares.com/about', title: 'About Us' }) }} />
                            </View>

                            {/* Logout button */}
                            <View style={{ alignItems: 'center', marginTop: 16 }}>
                                <Ripple onPress={() => setshowConfirmation(true)} style={s.logoutBtn}>
                                    <LogOut size={18} color={'#F04438'} />
                                    <Text style={[styles.text_14_semi_mainTextColor2, { color: '#F04438', marginLeft: 10 }]}>Log Out</Text>
                                </Ripple>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {showConfirmation && (
                <AlertModel
                    onPress={handleLogoutFunction}
                    title={"Logout"}
                    description={"Are you sure you want to logout ?"}
                    onCancel={() => setshowConfirmation(false)}
                />
            )}
        </>
    )


}

export default Profile

// Simple row item used above
const RowItem = ({ icon, title, right, onPress }) => {
    return (
        <Ripple onPress={onPress} style={s.row} rippleColor={'#eee'}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={s.iconWrap}>{icon}</View>
                <Text style={s.rowTitle}>{title}</Text>
            </View>
            {right ? right : <ChevronRight size={18} color={'#9BA1A6'} />}
        </Ripple>
    );
};

const s = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        overflow: 'hidden'
    },
    row: {
        height: 52,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1'
    },
    iconWrap: {
        width: 28,
        alignItems: 'center',
        marginRight: 10
    },
    rowTitle: {
        fontSize: 14,
        color: '#111827'
    },
    logoutBtn: {
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F04438',
        flexDirection: 'row',
        alignItems: 'center'
    }
})
