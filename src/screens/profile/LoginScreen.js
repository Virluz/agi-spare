// LoginScreen.js
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { showErrorMsg } from '../../widgets/FlashMessages';
import { customerAccessTokenCreate } from '../../graphql/graph_request';


// Login Form Component
const LoginForm = ({ onLoginSuccess, switchToRecovery }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = await customerAccessTokenCreate({
                input: {
                    email,
                    password
                }
            });


            if (data.customerAccessTokenCreate.customerUserErrors.length > 0) {
                const error = data.customerAccessTokenCreate.customerUserErrors[0];
                showErrorMsg(error.message);
                return;
            }

            const accessToken = data.customerAccessTokenCreate.customerAccessToken.accessToken;
            onLoginSuccess(accessToken);

        } catch (err) {
            setError('An error occurred during login. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    editable={!isLoading}
                />
            </View>

            <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={switchToRecovery} disabled={isLoading}>
                <Text style={styles.linkText}>Forgot your password?</Text>
            </TouchableOpacity>
        </View>
    );
};

// Password Recovery Component
const PasswordRecovery = ({ switchToLogin }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');


    const handleRecovery = async () => {
        if (!email) {
            setMessage('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const { data } = await customerRecover({
                variables: { email }
            });

            if (data.customerRecover.customerUserErrors.length > 0) {
                const error = data.customerRecover.customerUserErrors[0];
                setMessage(error.message);
                return;
            }

            setMessage('Password reset instructions have been sent to your email.');

        } catch (err) {
            setMessage('An error occurred. Please try again.');
            console.error('Password recovery error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.formContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>

            {message ? (
                <Text style={message.includes('error') ? styles.errorText : styles.successText}>
                    {message}
                </Text>
            ) : null}

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                />
            </View>

            <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleRecovery}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Send Instructions</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={switchToLogin} disabled={isLoading}>
                <Text style={styles.linkText}>Back to login</Text>
            </TouchableOpacity>
        </View>
    );
};

// Main Login Screen Component
const LoginScreen = () => {
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    const handleLoginSuccess = (accessToken) => {
        // Store the access token securely (consider using SecureStore from expo-secure-store)
        console.log('Login successful, access token:', accessToken);
        // Navigate to the main app screen
        Alert.alert('Success', 'You have successfully logged in!');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Shopify</Text>
                </View>

                {isRecoveryMode ? (
                    <PasswordRecovery switchToLogin={() => setIsRecoveryMode(false)} />
                ) : (
                    <LoginForm
                        onLoginSuccess={handleLoginSuccess}
                        switchToRecovery={() => setIsRecoveryMode(true)}
                    />
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#95bf46', // Shopify green
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        color: '#666',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#374151',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    loginButton: {
        backgroundColor: '#95bf46',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: '#b8d48c',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkText: {
        color: '#95bf46',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    successText: {
        color: '#10b981',
        textAlign: 'center',
        marginBottom: 16,
    },
});

export default LoginScreen;