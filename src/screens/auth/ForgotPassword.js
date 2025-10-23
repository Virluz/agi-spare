import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toolbar from '../../components/ui/Toolbar';
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { widthPixel, heightPixel } from '../../utils/fonts';
import { EMAIL_REGEX } from '../../utils/Helper';
import { customerRecover } from '../../graphql/graph_request';

const ForgotPassword = () => {
    const navigation = useNavigation();
    const { colorScheme } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme];
    const stylesAll = AppStyles.getAllStyles(colorScheme);

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const onSubmit = async () => {
        if (!EMAIL_REGEX.test(email)) {
            Alert.alert('Invalid email', 'Please enter a valid email address.');
            return;
        }
        setIsLoading(true);
        setMessage('');
        try {
            const res = await customerRecover(email);
            const errs = res?.customerRecover?.customerUserErrors;
            if (errs && errs.length) {
                const msg = errs.map(e => e.message).join('\n');
                setMessage(msg);
            } else {
                setMessage('If an account exists, a password reset email has been sent.');
            }
        } catch (e) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const local = StyleSheet.create({
        container: { flex: 1, backgroundColor: colorSet.white },
        card: {
            marginTop: -heightPixel(40),
            marginHorizontal: widthPixel(16),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            backgroundColor: '#fff',
            padding: widthPixel(16),
        },
        title: {
            ...stylesAll.text_20_reg_white_secondaryFont,
            color: '#111',
            fontWeight: '800',
            letterSpacing: 1,
            textAlign: 'center',
            marginTop: heightPixel(8),
            marginBottom: heightPixel(4),
        },
        subtitle: {
            ...stylesAll.text_14_reg_mainTextColor2,
            textAlign: 'center',
            marginBottom: heightPixel(12),
        },
        label: {
            ...stylesAll.text_14_reg_mainTextColor2,
            marginTop: heightPixel(8),
            marginBottom: heightPixel(4),
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
            backgroundColor: '#FAFAFA',
        },
        continueBtn: {
            width: '100%',
            height: 44,
            backgroundColor: '#C1272D',
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: heightPixel(12),
        },
        continueBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
        footerText: { color: '#888', fontSize: 14, textAlign: 'center', marginTop: heightPixel(12) },
        link: { color: '#E9003F', textDecorationLine: 'underline' },
        msg: { textAlign: 'center', color: '#444', marginTop: heightPixel(10) },
    });

    return (
        <>
            <Toolbar title="Forgot Password" onBackPress={() => navigation.goBack()} />
            <ScrollView style={local.container} contentContainerStyle={{ paddingBottom: heightPixel(40) }}>
                <View style={{ marginTop: heightPixel(24) }}>
                    <View style={local.card}>
                        <Text style={local.title}>Reset your password</Text>
                        <Text style={local.subtitle}>Enter your account email. We'll send you a password reset link.</Text>

                        <Text style={local.label}>Email</Text>
                        <TextInput
                            style={local.input}
                            keyboardType="email-address"
                            placeholder="you@example.com"
                            placeholderTextColor="#A0A0A0"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        {!!message && <Text style={local.msg}>{message}</Text>}

                        <TouchableOpacity style={local.continueBtn} onPress={onSubmit} disabled={isLoading}>
                            <Text style={local.continueBtnText}>{isLoading ? 'SENDING…' : 'SEND RESET LINK'}</Text>
                        </TouchableOpacity>

                        <Text style={local.footerText}>
                            Remembered your password?{' '}
                            <Text onPress={() => navigation.goBack()} style={local.link}>Back to login</Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
};

export default ForgotPassword;
