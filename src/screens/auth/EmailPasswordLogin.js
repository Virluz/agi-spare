import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { showErrorMsg, showSuccessMsg } from '../../widgets/FlashMessages';
import { EMAIL_REGEX, _getVerticalPadding } from '../../utils/Helper';
import { loginCustomer, customerRecover } from '../../graphql/graph_request';
import { saveAuthToken } from '../../utils/customerAuth';
import { setIsLoggedIn } from '../../redux/reducers/appSlice';

const EmailPasswordLogin = () => {
  const { colorScheme } = useSelector(state => state.app);
  const styles = AppStyles.getAllStyles(colorScheme);
  const colorSet = AppStyles.colorSet[colorScheme];
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const emailValid = useMemo(() => EMAIL_REGEX.test(String(email).trim()), [email]);
  const canSubmit = emailValid && String(password).length >= 1 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const data = await loginCustomer(String(email).trim(), String(password));
      const errs = data?.customerAccessTokenCreate?.customerUserErrors;
      if (errs && errs.length) {
        const msg = errs.map(e => e?.message).filter(Boolean).join(', ');
        showErrorMsg(msg || 'Login failed');
        return;
      }
      const tokenObj = data?.customerAccessTokenCreate?.customerAccessToken;
      const accessToken = tokenObj?.accessToken;
      const expiresAt = tokenObj?.expiresAt;
      if (!accessToken) {
        showErrorMsg('Login failed: Missing access token');
        return;
      }
      await saveAuthToken(accessToken, expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString());
      dispatch(setIsLoggedIn(true));
      showSuccessMsg('Logged in successfully');
      navigation.goBack();
      // navigation.reset({ index: 0, routes: [{ name: 'MainStack' }] });
    } catch (e) {
      showErrorMsg(String(e?.message || e || 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async () => {
    if (!emailValid || recovering) return;
    setRecovering(true);
    try {
      const data = await customerRecover(String(email).trim());
      const errs = data?.customerRecover?.customerUserErrors;
      if (errs && errs.length) {
        const msg = errs.map(e => e?.message).filter(Boolean).join(', ');
        showErrorMsg(msg || 'Failed to send reset instructions');
        return;
      }
      showSuccessMsg('Password reset instructions sent to your email');
    } catch (e) {
      showErrorMsg(String(e?.message || e || 'Failed to send reset instructions'));
    } finally {
      setRecovering(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colorSet.mainThemeBackgroundColor }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 24, flex: 1 }}>
        <Text style={[styles.text_20_secondaryFont_mainTextColor2, { textAlign: 'center' }]}>Welcome Back</Text>
        {_getVerticalPadding(6)}
        <Text style={[styles.text_12_reg_mainTextColor2, { textAlign: 'center', opacity: 0.8 }]}>Sign in with your email and password</Text>

        {_getVerticalPadding(24)}

        <Text style={[styles.text_12_reg_mainTextColor2, localStyles.label]}>Email</Text>
        <TextInput
          style={[localStyles.input, styles.text_14_reg_mainTextColor2]}
          placeholder="Enter your email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
        />

        {_getVerticalPadding(12)}

        <Text style={[styles.text_12_reg_mainTextColor2, localStyles.label]}>Password</Text>
        <TextInput
          style={[localStyles.input, styles.text_14_reg_mainTextColor2]}
          placeholder="Enter your password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
        />

        {_getVerticalPadding(16)}

        <PrimaryButton title={loading ? 'Signing in…' : 'Sign In'} disabled={!canSubmit} onPress={handleLogin} />

        {_getVerticalPadding(10)}

        {/* <TouchableOpacity onPress={handleRecover} disabled={!emailValid || recovering}>
          <Text style={[styles.text_12_reg_mainTextColor2, { textAlign: 'center', textDecorationLine: 'underline', opacity: (emailValid && !recovering) ? 1 : 0.6 }]}>
            {recovering ? 'Sending…' : 'Forgot your password?'}
          </Text>
        </TouchableOpacity> */}


        <TouchableOpacity
          style={localStyles.createAccountButton}
          onPress={() => navigation.navigate('CreateAccount')}
        // disabled={isLoading}
        >
          <Text style={[styles.text_12_reg_mainTextColor2, { textDecorationLine: 'underline' }]}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  label: {
    marginBottom: 6,
  },
  createAccountButton: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
});

export default EmailPasswordLogin;
