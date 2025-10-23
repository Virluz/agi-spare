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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import CommonInput from '../../components/ui/CommonInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { widthPixel, heightPixel } from '../../utils/fonts';
import { EMAIL_REGEX } from '../../utils/Helper';
import { loginCustomer } from '../../graphql/graph_request';
import Toolbar from '../../components/ui/Toolbar';

const Login = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { colorScheme } = useSelector(state => state.app);
    const [isLoading, setIsLoading] = useState(false);

    const colorSet = AppStyles.colorSet[colorScheme];
    const styles = AppStyles.getAllStyles(colorScheme);

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: 'vikassalunkhe47@gmail.com',
            password: '123456',
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await loginCustomer(data.email, data.password);

            if (response.customerAccessTokenCreate.customerUserErrors?.length > 0) {
                const error = response.customerAccessTokenCreate.customerUserErrors[0];
                Alert.alert('Error', JSON.stringify(error));
                return;
            }

            const { accessToken, expiresAt } = response.customerAccessTokenCreate.customerAccessToken;

            // Save the access token
            await AsyncStorage.setItem('customerAccessToken', accessToken);
            await AsyncStorage.setItem('tokenExpiresAt', expiresAt);

            // You might want to dispatch a success action here
            // dispatch(setCustomerToken(accessToken));

            // Navigate to home or previous screen
            navigation.goBack();

        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToSignup = () => {
        navigation.navigate('SignUp');
    };

    const navigateToForgotPassword = () => {
        navigation.navigate('ForgotPassword');
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
        forgotPassword: {
            alignSelf: 'flex-end',
            marginTop: heightPixel(8),
            marginBottom: heightPixel(24),
        },
        forgotPasswordText: {
            ...styles.text_14_reg_primaryColor,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: heightPixel(24),
        },
        footerText: {
            ...styles.text_14_reg_mainTextColor2,
        },
        signupLink: {
            marginLeft: widthPixel(4),
        },
        signupText: {
            ...styles.text_14_semi_primaryColor,
        },
    });

    return (
        <>
            <Toolbar title="Login" />
            <ScrollView style={localStyles.container}>
                <Text style={localStyles.title}>Welcome back!</Text>
                <Text style={localStyles.subtitle}>Please sign in to continue</Text>

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

                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="password"
                        placeholder="Password"
                        label="Password"
                        secureTextEntry
                        control={control}
                        errors={errors}
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        }}
                    />
                </View>

                <TouchableOpacity
                    style={localStyles.forgotPassword}
                    onPress={navigateToForgotPassword}
                >
                    <Text style={localStyles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <PrimaryButton
                    title={isLoading ? "LOGGING IN..." : "LOGIN"}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                />

                <View style={localStyles.footer}>
                    <Text style={localStyles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity style={localStyles.signupLink} onPress={navigateToSignup}>
                        <Text style={localStyles.signupText}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
};

export default Login;