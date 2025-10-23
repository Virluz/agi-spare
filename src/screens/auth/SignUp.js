import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import CommonInput from '../../components/ui/CommonInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { widthPixel, heightPixel } from '../../utils/fonts';
import { EMAIL_REGEX } from '../../utils/Helper';
import { registerUser } from '../../api/requests';
import { loginCustomer, createAccessTokenWithMultipass } from '../../graphql/graph_request';
import { saveAuthToken } from '../../utils/customerAuth';
import { setIsLoggedIn } from '../../redux/reducers/appSlice';
import Toolbar from '../../components/ui/Toolbar';

const SignUp = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { colorScheme } = useSelector(state => state.app);
    const [isLoading, setIsLoading] = useState(false);

    const colorSet = AppStyles.colorSet[colorScheme];
    const styles = AppStyles.getAllStyles(colorScheme);

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            acceptsMarketing: true,
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const mobile = route?.params?.mobile;
            const otp = route?.params?.otp;
            if (!mobile || !otp) {
                Alert.alert('Missing info', 'Mobile or OTP is missing for registration.');
                return;
            }

            const payload = {
                email: data.email,
                first_name: data.firstName,
                last_name: data.lastName,
                mobile,
                otp,
                modifiedShopURL: process.env.SHOPIFY_URL,
                api_key: process.env.LOGIN_API_KEY,
            };

            const res = await registerUser(payload);

            console.log('Registration response:', res, payload);
            if (res?.success === false) {
                Alert.alert('Error', res?.message || 'Registration failed');
                return;
            }

            // Complete login using response
            let accessToken = null;
            let expiresAt = null;

            if (res.type === 'EXISTING_USER_WITH_EMAIL_FOUND') {
                return Alert.alert('Error', 'An account with this email already exists. Please use different email instead.');
            }
            if (res?.multipass_token) {
                const tokenObj = await createAccessTokenWithMultipass(res.multipass_token);
                accessToken = tokenObj?.accessToken;
                expiresAt = tokenObj?.expiresAt;
            } else if (res?.email && res?.xattr) {
                const loginResp = await loginCustomer(res.email, res.xattr);
                const errs = loginResp?.customerAccessTokenCreate?.customerUserErrors;
                if (errs && errs.length) {
                    const msg = errs.map(e => e.message).join(', ');
                    Alert.alert('Login failed', msg || 'Unable to login after registration');
                    return;
                }
                const tokenObj = loginResp?.customerAccessTokenCreate?.customerAccessToken;
                accessToken = tokenObj?.accessToken;
                expiresAt = tokenObj?.expiresAt;
            }

            if (!accessToken) {
                Alert.alert('Login failed', 'Could not retrieve access token.');
                return;
            }

            await saveAuthToken(accessToken, expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString());
            dispatch(setIsLoggedIn(true));

            //go back two screens to avoid going to login screen
            navigation.goBack();
            navigation.goBack();

        } catch (error) {
            console.error('Signup error:', error);
            Alert.alert('Error', 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToLogin = () => {
        navigation.navigate('Login');
    };

    const localStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colorSet.white,
            padding: widthPixel(16),
        },
        title: {
            ...styles.text_24_bold_mainTextColor2,
            marginVertical: heightPixel(24),
        },
        subtitle: {
            ...styles.text_14_reg_mainTextColor2,
            marginBottom: heightPixel(32),
        },
        inputContainer: {
            marginBottom: heightPixel(16),
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: heightPixel(24),
            marginBottom: heightPixel(24),
        },
        footerText: {
            ...styles.text_14_reg_mainTextColor2,
        },
        loginLink: {
            marginLeft: widthPixel(4),
        },
        loginText: {
            ...styles.text_14_semi_primaryColor,
        },
    });

    return (
        <>
            <Toolbar title="Sign Up" />
            <ScrollView style={localStyles.container}>
                <Text style={localStyles.title}>Create Account</Text>
                <Text style={localStyles.subtitle}>Please fill in the details below</Text>

                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="firstName"
                        placeholder="First Name"
                        label="First Name"
                        control={control}
                        errors={errors}
                        rules={{
                            required: 'First name is required',
                        }}
                    />
                </View>

                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="lastName"
                        placeholder="Last Name"
                        label="Last Name"
                        control={control}
                        errors={errors}
                        rules={{
                            required: 'Last name is required',
                        }}
                    />
                </View>

                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="email"
                        placeholder="Email"
                        label="Email"
                        control={control}
                        errors={errors}
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: EMAIL_REGEX,
                                message: 'Invalid email address',
                            },
                        }}
                    />
                </View>

                {/* Password fields removed for API-based registration flow */}

                <PrimaryButton
                    title={isLoading ? "Registering..." : "Register"}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                />

                <View style={localStyles.footer}>
                    <Text style={localStyles.footerText}>Already have an account?</Text>
                    <TouchableOpacity style={localStyles.loginLink} onPress={navigateToLogin}>
                        <Text style={localStyles.loginText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
};

export default SignUp;