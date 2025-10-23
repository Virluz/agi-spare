import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import RawBottomSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import AppStyles from '../../styles/AppStyles';

const LoginBottomSheet = React.forwardRef(
    (
        {
            onRequestOtp,
            onVerifyOtp,
            onResendOtp,
            onSkip,
            onSuccessStart,
            initialPhone = '',
            height = 640,
        },
        ref,
    ) => {
        const styles = AppStyles.getAllStyles();
        const colorSet = AppStyles.colorSet[styles.colorScheme];
        const [step, setStep] = useState(0); // 0: login, 1: otp, 2: success
        const [phone, setPhone] = useState(initialPhone);
        const [otp, setOtp] = useState(['', '', '', '', '', '']);
        const [loading, setLoading] = useState(false);
        const [counter, setCounter] = useState(30);
        const [isResending, setIsResending] = useState(false);
        const inputsRef = useRef([]);

        const phoneIsValid = useMemo(() => /^[6-9]\d{9}$/.test(phone), [phone]);
        const otpCode = useMemo(() => otp.join(''), [otp]);
        const otpIsValid = useMemo(() => /^\d{6}$/.test(otpCode), [otpCode]);

        useEffect(() => {
            if (step === 1 && counter > 0) {
                const id = setTimeout(() => setCounter((c) => c - 1), 1000);
                return () => clearTimeout(id);
            }
        }, [counter, step]);

        const handleContinueFromPhone = async () => {
            if (!phoneIsValid || loading) return;
            setLoading(true);
            try {
                await onRequestOtp?.(phone);
                setStep(1);
                setCounter(30);
                // focus first OTP box
                setTimeout(() => inputsRef.current?.[0]?.focus?.(), 200);
            } finally {
                setLoading(false);
            }
        };

        const handleVerify = async () => {
            if (!otpIsValid || loading) return;
            setLoading(true);
            try {
                await onVerifyOtp?.(phone, otpCode);
                setStep(2);
            } finally {
                setLoading(false);
            }
        };

        const handleResend = async () => {
            if (counter > 0 || isResending) return;
            setIsResending(true);
            try {
                await onResendOtp?.(phone);
                setCounter(30);
            } finally {
                setIsResending(false);
            }
        };

        const editNumber = () => {
            setStep(0);
            setOtp(['', '', '', '', '', '']);
        };

        const header = (
            <View>
                <LinearGradient colors={["#C1272D", "#B1132B"]} style={localStyles.headerGrad}>
                    <Image
                        source={require('../../../assets/images/onboard/first.png')}
                        style={localStyles.headerPeople}
                        resizeMode="contain"
                    />
                </LinearGradient>
                <View style={localStyles.curve} />
            </View>
        );

        const PhoneView = (
            <View style={localStyles.content}>
                <Text style={[styles.text_20_bold_mainTextColor2, localStyles.title]}>HELLO USER!</Text>
                <Text style={[styles.text_14_mainTextColor2, localStyles.subtitle]}>Log in to your account.</Text>
                <Text style={[styles.text_14_mainTextColor2, localStyles.label]}>Enter Your Mobile Number</Text>
                <TextInput
                    style={localStyles.input}
                    accessibilityLabel="phone-input"
                    placeholder="Enter Your Phone no"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
                    maxLength={10}
                    returnKeyType="done"
                />
                <Text style={localStyles.termsText}>
                    By Continuing, you agree to our <Text style={localStyles.link}>Privacy Policy</Text> and{' '}
                    <Text style={localStyles.link}>Terms & Condition</Text>.
                </Text>
                <TouchableOpacity
                    style={[localStyles.continueBtn, !phoneIsValid && localStyles.btnDisabled]}
                    onPress={handleContinueFromPhone}
                    disabled={!phoneIsValid || loading}
                    accessibilityRole="button"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={localStyles.continueBtnText}>CONTINUE</Text>
                    )}
                </TouchableOpacity>
                <Text style={localStyles.orText}>or log in with</Text>
                <View style={localStyles.socialRow}>
                    <TouchableOpacity style={localStyles.socialIcon} disabled>
                        <Image source={require('../../../assets/images/img.png')} style={localStyles.iconImg} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={localStyles.skipBtn} onPress={onSkip}>
                    <Text style={localStyles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>
        );

        const OtpView = (
            <View style={localStyles.content}>
                <Text style={[styles.text_20_bold_mainTextColor2, localStyles.title]}>ALMOST THERE</Text>
                <Text style={[styles.text_14_mainTextColor2, localStyles.subtitle]}>
                    Please enter the 6-Digit OTP that we've just sent on {phone}
                </Text>
                <View style={localStyles.otpRow}>
                    {otp.map((digit, idx) => (
                        <TextInput
                            ref={(r) => (inputsRef.current[idx] = r)}
                            key={idx}
                            style={localStyles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            autoCorrect={false}
                            onChangeText={(val) => {
                                const clean = val.replace(/[^0-9]/g, '').slice(0, 1);
                                const next = [...otp];
                                next[idx] = clean;
                                setOtp(next);
                                if (clean && idx < 5) inputsRef.current[idx + 1]?.focus?.();
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
                                    inputsRef.current[idx - 1]?.focus?.();
                                }
                            }}
                        />)
                    )}
                </View>
                <View style={localStyles.otpActionsRow}>
                    <TouchableOpacity onPress={editNumber}>
                        <Text style={localStyles.otpActionText}>Edit Number</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResend} disabled={counter > 0 || isResending}>
                        <Text style={localStyles.otpActionText}>
                            {counter > 0 ? `Resend OTP in ${counter}s` : isResending ? 'Resending…' : 'Resend OTP'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[localStyles.continueBtn, !otpIsValid && localStyles.btnDisabled]}
                    onPress={handleVerify}
                    disabled={!otpIsValid || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={localStyles.continueBtnText}>CONTINUE</Text>
                    )}
                </TouchableOpacity>
            </View>
        );

        const SuccessView = (
            <View style={localStyles.content}>
                <View style={localStyles.successBox}>
                    <Text style={localStyles.successLogo}>STYLE UNION</Text>
                    <Text style={localStyles.successText}>You are successfully Logged In</Text>
                    <TouchableOpacity style={localStyles.startBtn} onPress={onSuccessStart}>
                        <Text style={localStyles.startBtnText}>Start Styling</Text>
                    </TouchableOpacity>
                    <ActivityIndicator size="small" color="#C1272D" />
                </View>
            </View>
        );

        return (
            <>

                {header}

                {step === 0 && PhoneView}
                {step === 1 && OtpView}
                {step === 2 && SuccessView}
            </>
        );
    },
);

const localStyles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    headerGrad: {
        width: '100%',
        height: 200,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    headerImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
    },
    headerPeople: {
        width: '80%',
        height: 160,
    },
    curve: {
        position: 'absolute',
        bottom: -24,
        left: -50,
        right: -50,
        height: 48,
        backgroundColor: '#fff',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 12,
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
    termsText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 12,
        textAlign: 'center',
    },
    link: {
        color: '#E9003F',
        textDecorationLine: 'underline',
    },
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
    btnDisabled: {
        opacity: 0.5,
    },
    continueBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    orText: {
        fontSize: 13,
        color: '#888',
        marginVertical: 8,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    socialIcon: {
        marginHorizontal: 8,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 8,
        elevation: 2,
    },
    iconImg: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    skipBtn: {
        marginTop: 8,
    },
    skipText: {
        color: '#888',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
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
    otpActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    otpActionText: {
        color: '#888',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    successBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        alignItems: 'center',
        paddingVertical: 32,
        marginTop: 24,
        elevation: 2,
    },
    successLogo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },
    successText: {
        fontSize: 16,
        color: '#222',
        marginBottom: 16,
        textAlign: 'center',
    },
    startBtn: {
        backgroundColor: '#C1272D',
        borderRadius: 6,
        paddingHorizontal: 24,
        paddingVertical: 10,
        marginBottom: 16,
    },
    startBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loader: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderTopColor: '#C1272D',
        marginTop: 8,
    },
});

export default LoginBottomSheet;
