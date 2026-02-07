import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Clipboard } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import AppStyles from '../styles/AppStyles';
import { sendOtpMobile, validateOtpMobile, registerUser, sendOtpEmail, validateOtpExistingEmail, validateSocialAuthToken } from '../api/requests';
import { showErrorMsg, showSuccessMsg } from '../widgets/FlashMessages';
import RBSheet from 'react-native-raw-bottom-sheet';
import { _getVerticalPadding } from '../utils/Helper';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setIsLoggedIn } from '../redux/reducers/appSlice';
import { loginCustomer, createAccessTokenWithMultipass } from '../graphql/graph_request';
import { saveAuthToken } from '../utils/customerAuth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken, Profile, Settings } from 'react-native-fbsdk-next';
import appleAuth from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventBus from '../service/EventBus';
import { GOOGLE_WEB_CLIENT_ID, SHOPIFY_URL, LOGIN_API_KEY, FACEBOOK_APP_ID, FACEBOOK_CLIENT_TOKEN } from '@env';
import Toolbar from '../components/ui/Toolbar';

// Screen that matches the provided mock: phone entry on the page, OTP via bottom sheet only
const LoginWithOtpScreen = ({
    onSkip,
    onStartStyling,
}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const styles = AppStyles.getAllStyles();
    const colorSet = AppStyles.colorSet[styles.colorScheme];

    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const otpRef = useRef(null);

    const OTP_LENGTH = 4; // adjust if backend expects a different length
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const inputsRef = useRef([]);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [flowStep, setFlowStep] = useState('PHONE'); // PHONE | OTP | REGISTER | EMAIL_OTP
    const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '' });
    const [emailOtp, setEmailOtp] = useState(['', '', '', '']);
    const emailOtpRefs = useRef([]);
    const [emailOtpLoading, setEmailOtpLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [showSkip, setShowSkip] = useState(false);

    // Show Skip button only the first time this screen is opened
    useEffect(() => {
        (async () => {
            try {
                const key = 'HAS_SEEN_LOGIN_SCREEN';
                const seen = await AsyncStorage.getItem(key);
                if (!seen) {
                    setShowSkip(true);
                    // await AsyncStorage.setItem(key, 'true');
                }
            } catch (_) { }
        })();
    }, []);

    // Configure Google Sign-In SDK once (requires GOOGLE_WEB_CLIENT_ID from .env)
    useEffect(() => {
        try {
            const webClientId = '793612694158-ds5n3o1ajl36op7k22ss5essebs728jg.apps.googleusercontent.com';
            console.log('🔵 Google Web Client ID:', webClientId ? '✅ Loaded' : '❌ Missing');

            // if (webClientId) {
            GoogleSignin.configure({
                offlineAccess: false,
                webClientId,
            });
            console.log('✅ GoogleSignin configured successfully');
            // } else {
            //     // Configure without webClientId to avoid invalid config; we'll block sign-in later
            //     GoogleSignin.configure({ offlineAccess: false });
            //     console.warn('⚠️ GOOGLE_WEB_CLIENT_ID is missing. Set it in .env to enable Google Sign-In.');
            // }

            // Configure Facebook SDK if env is available
            // try {
            //     if (FACEBOOK_APP_ID) Settings.setAppID(FACEBOOK_APP_ID);
            //     if (FACEBOOK_CLIENT_TOKEN) Settings.setClientToken(FACEBOOK_CLIENT_TOKEN);
            //     Settings.initializeSDK();
            // } catch (_) { }
        } catch (error) {
            console.error('Google Sign-In configuration error:', error);
        }
    }, []);

    // Optional: clear success when user edits phone
    useEffect(() => {
        setSuccess(false);
    }, [phone]);

    const phoneIsValid = useMemo(() => /^[6-9]\d{9}$/.test(phone), [phone]);

    const handleRequestOtp = async () => {
        if (!phoneIsValid || loading) return;
        setLoading(true);
        try {
            const payload = {
                mobile: `+91${phone}`,
                api_key: LOGIN_API_KEY,
                modifiedShopURL: SHOPIFY_URL,
            };
            const res = await sendOtpMobile(payload);
            if (res?.success === false) {
                showErrorMsg(res?.message || 'Unable to send OTP');
                return;
            }
            showSuccessMsg('OTP sent');
            setOtp(Array(OTP_LENGTH).fill(''));
            otpRef.current?.open();
            // setFlowStep('OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (p, code) => {
        try {
            setVerifyLoading(true);
            const payload = {
                mobile: `+91${p}`,
                otp: code,
                api_key: LOGIN_API_KEY,
                modifiedShopURL: SHOPIFY_URL,
            };
            const res = await validateOtpMobile(payload);

            console.log('OTP validation response:', res);

            // return;
            // If API uses success flag, respect it
            if (res?.success === false) {
                showErrorMsg(res?.message || 'Invalid OTP');
                return;
            }

            if (res?.type === 'REGISTER') {
                // Use standalone SignUp screen
                otpRef.current?.close?.();
                navigation.navigate('CreateAccount', { mobile: `+91${p}`, otp: code });
                return;
            }


            await completeLoginFromResponse(res);
        } catch (e) {
            showErrorMsg('Something went wrong');
        } finally {
            setVerifyLoading(false);
        }
    };

    const completeLoginFromResponse = async (res) => {
        try {
            let accessToken = null;
            let expiresAt = null;
            if (res?.multipass_token) {
                const tokenObj = await createAccessTokenWithMultipass(res.multipass_token);
                accessToken = tokenObj?.accessToken;
                expiresAt = tokenObj?.expiresAt;
            } else if (res?.email && res?.xattr) {
                const loginResp = await loginCustomer(res.email, res.xattr);
                const errs = loginResp?.customerAccessTokenCreate?.customerUserErrors;
                if (errs && errs.length) {
                    const msg = errs.map(e => e.message).join(', ');
                    throw new Error(msg || 'Login failed');
                }
                const tokenObj = loginResp?.customerAccessTokenCreate?.customerAccessToken;
                accessToken = tokenObj?.accessToken;
                expiresAt = tokenObj?.expiresAt;
            }

            if (!accessToken) throw new Error('Failed to retrieve access token');

            await saveAuthToken(accessToken, expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString());

            // Publish login success event so credentials are reloaded

            dispatch(setIsLoggedIn(true));
            showSuccessMsg('Logged in successfully');

            // Log login event


            otpRef.current?.close?.();
            navigation.reset({ index: 0, routes: [{ name: 'MainStack' }] });

            eventBus.publish('login_success');


        } catch (err) {
            showErrorMsg(String(err?.message || err || 'Login failed'));
        }
    };

    const handleResendOtp = async (p) => {
        try {
            const payload = {
                mobile: `+91${p}`,
                api_key: LOGIN_API_KEY,
                modifiedShopURL: SHOPIFY_URL,
            };
            const res = await sendOtpMobile(payload);
            if (res?.success === false) {
                showErrorMsg(res?.message || 'Unable to resend OTP');
                return;
            }
            showSuccessMsg('OTP resent');
        } catch (e) {
            showErrorMsg('Unable to resend OTP');
        }
    };

    // Google login handler – retrieves email from SDK
    const handleGoogleLogin = async () => {
        try {
            // if (!GOOGLE_WEB_CLIENT_ID) {
            //     showErrorMsg('Google Sign-In not configured: GOOGLE_WEB_CLIENT_ID missing');
            //     console.error('GOOGLE_WEB_CLIENT_ID is not set');
            //     return;
            // }

            if (Platform.OS === 'android') {
                const hasPlay = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
                if (!hasPlay) {
                    showErrorMsg('Google Play Services not available');
                    return;
                }
            }

            console.log('🔵 Starting Google Sign-In...');
            const result = await GoogleSignin.signIn();
            console.log('✅ Google Sign-In successful');
            console.log('📧 Email:', result?.user?.email);

            const email = result?.user?.email;
            if (!email) {
                showErrorMsg('No email returned from Google');
                return;
            }
            // Exchange email via social auth endpoint to get login payload
            const payload = {
                email,
                modifiedShopURL: SHOPIFY_URL,
                api_key: LOGIN_API_KEY,
            };
            const res = await validateSocialAuthToken(payload);
            if (res?.success === false) {
                showErrorMsg(res?.message || 'Social login failed');
                return;
            }

            // Log Google login event
            console.log("resonse ", res);


            await completeLoginFromResponse(res);
        } catch (e) {
            console.error('Google Sign-In error:', e?.code, e?.message);
            if (e?.code === statusCodes.DEVELOPER_ERROR) {
                showErrorMsg('Google Sign-In DEVELOPER_ERROR: Check package name, SHA-1 and Web Client ID');
                console.error('DEVELOPER_ERROR details:', e);
                return;
            }
            if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
                showErrorMsg('Google Sign-In cancelled');
                return;
            }
            if (e?.code === statusCodes.IN_PROGRESS) {
                showErrorMsg('Google Sign-In already in progress');
                return;
            }
            if (e?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                showErrorMsg('Google Play Services not available or outdated');
                return;
            }
            showErrorMsg(e?.message || 'Google Sign-In failed');
        }
    };

    // Facebook login handler – retrieves email via Graph API permissions
    const handleFacebookLogin = async () => {
        try {
            // Ensure fresh state
            try { await LoginManager.logOut(); } catch (_) { }
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
            if (result.isCancelled) {
                showErrorMsg('Facebook Sign-In cancelled');
                return;
            }
            const data = await AccessToken.getCurrentAccessToken();
            if (!data?.accessToken) {
                showErrorMsg('No Facebook access token');
                return;
            }
            // Fetch email via Graph API
            const resp = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${data.accessToken}`);
            const json = await resp.json();
            const email = json?.email;
            if (!email) {
                showErrorMsg('Facebook did not return an email');
                return;
            }
            const payload = {
                email,
                modifiedShopURL: SHOPIFY_URL,
                api_key: LOGIN_API_KEY,
            };
            const res = await validateSocialAuthToken(payload);
            if (res?.success === false) {
                showErrorMsg(res?.message || 'Social login failed');
                return;
            }



            await completeLoginFromResponse(res);
        } catch (e) {
            showErrorMsg(e?.message || 'Facebook Sign-In failed');
        }
    };

    // Apple login handler – iOS 13+ only
    const handleAppleLogin = async () => {
        try {
            if (Platform.OS !== 'ios') {
                showErrorMsg('Sign in with Apple is available on iOS only');
                return;
            }
            if (DeviceInfo.isEmulatorSync?.() === true) {
                showErrorMsg('Apple Sign-In is not supported on the iOS simulator. Please test on a real device.');
                return;
            }
            if (!appleAuth.isSupported) {
                showErrorMsg('Sign in with Apple not supported on this device/iOS version');
                return;
            }
            const response = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
            });
            const userId = response?.user;
            let email = response?.email; // Present on first authorization only
            if (!email && userId) {
                // Try to reuse stored email for this Apple user
                const stored = await AsyncStorage.getItem(`apple_email:${userId}`);
                if (stored) email = stored;
            }
            if (email && userId) {
                // Persist mapping for next time
                await AsyncStorage.setItem(`apple_email:${userId}`, email);
            }
            if (!email) {
                showErrorMsg('Apple did not return an email. Sign in once to share email, or use phone/Google/Facebook.');
                return;
            }

            const payload = {
                email,
                modifiedShopURL: process.env.SHOPIFY_URL,
                api_key: "a1ce8163-5dcd-4d4f-b418-77337dc7c1c2" // process.env.LOGIN_API_KEY,
            };
            const res = await validateSocialAuthToken(payload);
            if (res?.success === false) {
                showErrorMsg(res?.message || 'Social login failed');
                return;
            }

            // Log Apple login event


            await completeLoginFromResponse(res);
        } catch (e) {
            const msg = e?.message || String(e) || 'Apple Sign-In failed';
            showErrorMsg(msg);
        }
    };

    const checkAndPasteOtp = async () => {
        try {
            const clipboardContent = await Clipboard.getString();
            // Check if clipboard contains a number matching OTP_LENGTH
            const otpMatch = clipboardContent.match(/\b\d{4,6}\b/);
            if (otpMatch) {
                const otpCode = otpMatch[0].slice(0, OTP_LENGTH);
                if (otpCode.length === OTP_LENGTH) {
                    const otpArray = otpCode.split('');
                    setOtp(otpArray);
                    // Auto-focus last input
                    setTimeout(() => inputsRef.current[OTP_LENGTH - 1]?.focus?.(), 100);
                }
            }
        } catch (e) {
            // Ignore clipboard errors
        }
    };

    const getVerifyOtpView = () => {
        return (
            <RBSheet
                ref={otpRef}
                height={380}
                closeOnDragDown={true}
                closeOnPressMask={true}
                closeOnPressBack
                onOpen={() => {
                    checkAndPasteOtp();
                    setTimeout(() => inputsRef.current[0]?.focus?.(), 100);
                }}
                customStyles={{ container: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, }, }}>

                <View style={{ alignItems: 'center', }}>

                    <Text style={[styles.text_20_secondaryFont_mainTextColor2]}>Almost there</Text>
                    {_getVerticalPadding(16)}

                    <Text style={[styles.text_14_reg_mainTextColor2,]}>Please enter the {OTP_LENGTH}-digit OTP that we’ve just sent on {phone}</Text>
                    {_getVerticalPadding(16)}

                </View>

                <View style={localStyles.otpRow}>
                    {otp.map((digit, idx) => (
                        <TextInput
                            ref={(r) => (inputsRef.current[idx] = r)}
                            key={idx}
                            style={localStyles.otpInput}
                            keyboardType="number-pad"
                            maxLength={OTP_LENGTH}
                            value={digit}
                            autoCorrect={false}
                            onChangeText={(val) => {
                                const clean = val.replace(/[^0-9]/g, '');

                                // If multiple digits pasted, distribute across all inputs
                                if (clean.length > 1) {
                                    const otpArray = clean.slice(0, OTP_LENGTH).split('');
                                    const next = [...otp];
                                    otpArray.forEach((digit, i) => {
                                        if (idx + i < OTP_LENGTH) {
                                            next[idx + i] = digit;
                                        }
                                    });
                                    setOtp(next);
                                    // Focus last filled input or last input
                                    const lastIdx = Math.min(idx + otpArray.length, OTP_LENGTH - 1);
                                    setTimeout(() => inputsRef.current[lastIdx]?.focus?.(), 10);
                                } else {
                                    // Single digit entry
                                    const next = [...otp];
                                    next[idx] = clean.slice(0, 1);
                                    setOtp(next);
                                    if (clean && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus?.();
                                }
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
                                    inputsRef.current[idx - 1]?.focus?.();
                                }
                            }}
                        />)
                    )}
                </View>

                {_getVerticalPadding(16)}

                <PrimaryButton
                    title={'Verify OTP'}
                    onPress={() => handleVerifyOtp(phone, otp.join(''))}
                    disabled={otp.join('').length !== OTP_LENGTH || verifyLoading}
                    loading={verifyLoading}
                />

                {_getVerticalPadding(8)}

                <TouchableOpacity onPress={() => handleResendOtp(phone)}>
                    <Text style={[styles.text_14_reg_mainTextColor2, { textAlign: 'center', textDecorationLine: 'underline' }]}>Resend OTP</Text>
                </TouchableOpacity>
            </RBSheet>
        )
    }

    return (
        <>

            <Toolbar title={"Login"} isSearch={false} />

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} bounces={false}>


                {_getVerticalPadding(16)}


                <View style={styles.container}>
                    <View style={localStyles.content}>
                        <Text style={[styles.text_20_secondaryFont_mainTextColor2]}>HELLO USER!</Text>
                        {_getVerticalPadding(16)}

                        <Text style={[styles.text_14_reg_mainTextColor2,]}>Log in to your account.</Text>
                        {_getVerticalPadding(16)}

                        {flowStep === 'PHONE' && (
                            <>
                                <Text style={[styles.text_14_reg_mainTextColor2, localStyles.label]}>Enter Your Mobile Number</Text>
                                <TextInput
                                    style={[localStyles.input, styles.text_14_reg_mainTextColor2]}
                                    placeholder="Enter Your Phone no"
                                    placeholderTextColor="#A0A0A0"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
                                    maxLength={10}
                                    returnKeyType="done"
                                />

                                {_getVerticalPadding(8)}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <Text style={styles.text_12_reg_mainTextColor2}>By continuing, you agree to our </Text>
                                    <Text
                                        style={[styles.text_12_reg_mainTextColor2, localStyles.link]}
                                        onPress={() => navigation.navigate('WebViewScreen', { url: 'https://agispares.com/pages/privacy-policy', title: 'Policies' })}
                                    >
                                        Privacy Policy
                                    </Text>
                                    <Text style={styles.text_12_reg_mainTextColor2}>{' '}and{' '}</Text>
                                    <Text
                                        style={[styles.text_12_reg_mainTextColor2, localStyles.link]}
                                        onPress={() => navigation.navigate('WebViewScreen', { url: 'https://agispares.com/pages/terms-of-use', title: 'Terms & Conditions' })}
                                    >
                                        Terms & Conditions
                                    </Text>
                                    <Text style={styles.text_12_reg_mainTextColor2}>.</Text>
                                </View>

                                {_getVerticalPadding(8)}
                            </>
                        )}


                        {/* <TouchableOpacity
                        style={[localStyles.continueBtn, !phoneIsValid && localStyles.btnDisabled]}
                        onPress={handleRequestOtp}
                        disabled={!phoneIsValid || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={localStyles.continueBtnText}>CONTINUE</Text>
                        )}
                    </TouchableOpacity> */}
                    </View>

                    {flowStep === 'PHONE' && (
                        <PrimaryButton
                            title={'CONTINUE'}
                            onPress={handleRequestOtp}
                            disabled={!phoneIsValid || loading}
                            loading={loading}
                        />
                    )}

                    <View style={{ alignItems: 'center' }}>


                        <Text style={styles.text_14_reg_mainTextColor2}>or log in with</Text>
                        {_getVerticalPadding(8)}
                        <View style={localStyles.socialRow}>


                            {Platform.OS === 'ios' ?
                                (
                                    <TouchableOpacity style={localStyles.socialIcon} onPress={handleAppleLogin}>
                                        <Image source={require('../../assets/images/account/apple.png')}
                                            style={{ width: 24, height: 24 }}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                )
                                :
                                (
                                    <TouchableOpacity style={localStyles.socialIcon} onPress={handleGoogleLogin}>
                                        <Image source={require('../../assets/images/account/google.png')}
                                            style={{ width: 24, height: 24 }}
                                            resizeMode="contain"

                                        />
                                    </TouchableOpacity>
                                )
                            }
                        </View>

                        {/* {showSkip && (
                            <TouchableOpacity style={localStyles.skipBtn}
                                onPress={() => {
                                    navigation.reset({ index: 0, routes: [{ name: 'MainStack' }] });

                                }}
                            >
                                <Text style={localStyles.skipText}>Skip</Text>
                            </TouchableOpacity>
                        )} */}
                    </View>

                </View>
            </ScrollView >

            {success && (
                <View style={localStyles.successPanel}>
                    <Text style={localStyles.successLogo}>STYLE UNION</Text>
                    <Text style={localStyles.successText}>You are successfully Logged In</Text>
                    <TouchableOpacity style={localStyles.startBtn} onPress={onStartStyling}>
                        <Text style={localStyles.startBtnText}>Start Styling</Text>
                    </TouchableOpacity>
                </View>
            )}

            {getVerifyOtpView()}

        </>

    );
};

const localStyles = StyleSheet.create({
    safe: { flex: 1 },
    headerWrap: {
        position: 'relative',
        width: '100%',
        height: 260,
        // backgroundColor: '#D30027',
        overflow: 'hidden',
    },
    headerMesh: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 100,
        // opacity: 0.35,

    },
    headerMain: {
        position: 'absolute',
        width: '100%',
        zIndex: 101,
        // marginTop: -0,
        // backgroundColor: 'red'
        height: 265,
    },
    headerCurve: {
        position: 'absolute',
        bottom: 0,
        // left: 0,
        // right: 0,
        width: '100%',
        height: 350,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        // paddingHorizontal: 24,
        // paddingTop: 24,
        // backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 8,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#222',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: 14,
        color: '#222',
        marginBottom: 4,
        marginTop: 8,
    },
    input: {
        width: '100%',
        height: 44,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#222',
        marginBottom: 8,
        backgroundColor: '#FAFAFA',
    },
    termsText: { fontSize: 12, color: '#888', marginBottom: 12, textAlign: 'center' },
    link: { color: '#E9003F', textDecorationLine: 'underline' },
    continueBtn: {
        width: '100%',
        height: 44,
        backgroundColor: '#C1272D',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    btnDisabled: { opacity: 0.5 },
    continueBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    orText: { fontSize: 13, color: '#888', marginVertical: 8 },
    socialRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    socialIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f2f2f2',
        marginHorizontal: 8,
    },
    skipBtn: { marginTop: 8 },
    skipText: { color: '#888', fontSize: 14, textDecorationLine: 'underline' },

    successPanel: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    successLogo: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 6 },
    successText: { fontSize: 15, color: '#222', marginBottom: 14, textAlign: 'center' },
    startBtn: { backgroundColor: '#C1272D', borderRadius: 6, paddingHorizontal: 24, paddingVertical: 10 },
    startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpInput: {
        width: 40,
        height: 44,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        marginHorizontal: 6,
        fontSize: 20,
        color: '#222',
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
    },
});

export default LoginWithOtpScreen;
