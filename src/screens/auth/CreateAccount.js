import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Modal,
    Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import CommonInput from '../../components/ui/CommonInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { widthPixel, heightPixel } from '../../utils/fonts';
import { EMAIL_REGEX } from '../../utils/Helper';
import { createCustomerWithMetafields } from '../../graphql/graph_request';
import { saveAuthToken } from '../../utils/customerAuth';
import { setIsLoggedIn } from '../../redux/reducers/appSlice';
import Toolbar from '../../components/ui/Toolbar';
import { ChevronDown } from 'lucide-react-native';

// Indian states list
const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
];

const CreateAccount = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { colorScheme } = useSelector(state => state.app);
    const [isLoading, setIsLoading] = useState(false);
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const colorSet = AppStyles.colorSet[colorScheme];
    const styles = AppStyles.getAllStyles(colorScheme);

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            // name: 'Test User',
            // company_name: 'test company',
            // gstNo: '27AAECS1234F1Z5',
            // mobile: '9876543210',
            // email: 'test@example.com',
            // buildingName: 'test building',
            // streetName: 'test street',
            // state: 'Maharashtra',
            // cityName: 'mumbai',
            // areaName: 'test',
            // pinCode: '400104',
            // username: 'tester',
            // password: 'App@12345',
            // confirmPassword: 'App@12345',
        }
    });

    const password = watch('password');

    const onSubmit = async (data) => {
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            // Split name into firstName and lastName
            const nameParts = data.name.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const payload = {
                firstName,
                lastName,
                email: data.email,
                password: data.password,
                phone: data.mobile.startsWith('+91') ? data.mobile : `+91${data.mobile}`,
                acceptsMarketing: true,
                // Address fields
                address1: data.buildingName,
                address2: data.streetName,
                city: data.cityName,
                province: data.state,
                zip: data.pinCode,
                country: 'India',
                // Metafields for custom fields
                metafields: {
                    companyName: data.company_name,
                    gstNo: data.gstNo,
                    areaName: data.areaName,
                    username: data.username,
                    state: data.state,
                    pinCode: data.pinCode,
                }
            };

            const result = await createCustomerWithMetafields(payload);

            if (result.success) {
                // Save auth token and login
                await saveAuthToken(
                    result.accessToken,
                    result.expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
                );
                dispatch(setIsLoggedIn(true));

                Alert.alert('Success', 'Account created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', result.message || 'Failed to create account');
            }
        } catch (error) {
            console.error('Create account error:', error);
            Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const localStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colorSet.white,
        },
        scrollContent: {
            padding: widthPixel(16),
            paddingBottom: heightPixel(40),
        },
        title: {
            ...styles.text_24_bold_mainTextColor2,
            marginVertical: heightPixel(24),
            textAlign: 'center',
        },
        inputContainer: {
            marginBottom: heightPixel(16),
        },
        pickerButton: {
            borderWidth: 1,
            borderColor: colorSet.dark4,
            borderRadius: 8,
            paddingHorizontal: widthPixel(12),
            paddingVertical: heightPixel(12),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colorSet.white,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        pickerContainer: {
            backgroundColor: colorSet.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70%',
        },
        pickerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: widthPixel(16),
            borderBottomWidth: 1,
            borderBottomColor: colorSet.dark4,
        },
        pickerTitle: {
            ...styles.text_16_semi_mainTextColor2,
        },
        pickerOption: {
            padding: widthPixel(16),
            borderBottomWidth: 1,
            borderBottomColor: colorSet.dark5,
        },
        passwordToggle: {
            position: 'absolute',
            height: '100%',
            justifyContent: 'center',
            right: widthPixel(12),
            padding: widthPixel(4),
        },
        buttonContainer: {
            marginTop: heightPixel(24),
        },
    });

    return (
        <>
            <Toolbar title="Create New Account" />
            <ScrollView style={localStyles.container} contentContainerStyle={localStyles.scrollContent}>
                <Text style={localStyles.title}>Create New Account</Text>

                {/* Name */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="name"
                        placeholder="Name"
                        label="Name"
                        control={control}
                        errors={errors}
                        rules={{ required: 'Name is required' }}
                    />
                </View>

                {/* Company Name */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="company_name"
                        placeholder="Company Name"
                        label="Company Name"
                        control={control}
                        errors={errors}
                        rules={{ required: 'Company name is required' }}
                    />
                </View>

                {/* GST No */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="gstNo"
                        placeholder="GST No"
                        label="GST No"
                        control={control}
                        errors={errors}
                        rules={{
                            required: 'GST number is required',
                            pattern: {
                                value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                                message: 'Invalid GST number format'
                            }
                        }}
                    />
                </View>

                {/* Mobile No */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="mobile"
                        placeholder="Mobile No"
                        label="Mobile No"
                        control={control}
                        errors={errors}
                        keyboardType="phone-pad"
                        rules={{
                            required: 'Mobile number is required',
                            pattern: {
                                value: /^[6-9]\d{9}$/,
                                message: 'Invalid mobile number'
                            }
                        }}
                        maxLength={10}
                    />
                </View>

                {/* Email ID */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="email"
                        placeholder="Email ID"
                        label="Email ID"
                        control={control}
                        errors={errors}
                        keyboardType="email-address"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: EMAIL_REGEX,
                                message: 'Invalid email address',
                            },
                        }}
                    />
                </View>

                {/* Building Name / Flat No. */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="buildingName"
                        placeholder="Building Name / Flat No."
                        label="Building Name / Flat No."
                        control={control}
                        errors={errors}
                        rules={{ required: 'Building name is required' }}
                    />
                </View>

                {/* Street Name */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="streetName"
                        placeholder="Street Name"
                        label="Street Name"
                        control={control}
                        errors={errors}
                        rules={{ required: 'Street name is required' }}
                    />
                </View>

                {/* Select State */}
                <View style={localStyles.inputContainer}>
                    <Text style={[styles.text_12_reg_mainTextColor2, { marginBottom: 4 }]}>Select State</Text>
                    <Controller
                        name="state"
                        control={control}
                        rules={{ required: 'State is required' }}
                        render={({ field: { value } }) => (
                            <TouchableOpacity
                                style={localStyles.pickerButton}
                                onPress={() => setShowStatePicker(true)}
                            >
                                <Text style={[styles.text_14_reg_mainTextColor2, !value && { color: colorSet.mainSubtextColor }]}>
                                    {value || 'Select State'}
                                </Text>
                                <ChevronDown size={widthPixel(20)} color={colorSet.dark3} />
                            </TouchableOpacity>
                        )}
                    />
                    {errors?.state && (
                        <Text style={{ color: 'red', marginTop: 4, fontSize: 12 }}>
                            {errors.state.message}
                        </Text>
                    )}
                </View>

                {/* City Name */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="cityName"
                        placeholder="City Name"
                        label="City Name"
                        control={control}
                        errors={errors}
                        rules={{ required: 'City name is required' }}
                    />
                </View>

                {/* Area Name */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="areaName"
                        placeholder="Area Name"
                        label="Area Name"
                        control={control}
                        errors={errors}
                        rules={{ required: 'Area name is required' }}
                    />
                </View>

                {/* Pin Code */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="pinCode"
                        placeholder="Pin Code"
                        label="Pin Code"
                        control={control}
                        errors={errors}
                        keyboardType="number-pad"
                        rules={{
                            required: 'Pin code is required',
                            pattern: {
                                value: /^[1-9][0-9]{5}$/,
                                message: 'Invalid pin code'
                            }
                        }}
                        maxLength={6}
                    />
                </View>

                {/* Username */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="username"
                        placeholder="Username"
                        label="Username"
                        control={control}
                        errors={errors}
                        rules={{
                            required: 'Username is required',
                            minLength: {
                                value: 3,
                                message: 'Username must be at least 3 characters'
                            }
                        }}
                    />
                </View>

                {/* Password */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="password"
                        placeholder="Password"
                        label="Password"
                        control={control}
                        errors={errors}
                        inputProps={{ secureTextEntry: !showPassword }}
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                            }
                        }}
                    />
                    <TouchableOpacity
                        style={localStyles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={styles.text_14_reg_mainTextColor3}>
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <View style={localStyles.inputContainer}>
                    <CommonInput
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        label="Confirm Password"
                        control={control}
                        errors={errors}
                        inputProps={{ secureTextEntry: !showConfirmPassword }}
                        rules={{
                            required: 'Please confirm your password',
                            validate: value => value === password || 'Passwords do not match'
                        }}
                    />
                    <TouchableOpacity
                        style={localStyles.passwordToggle}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Text style={styles.text_14_reg_mainTextColor3}>
                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Save Button */}
                <View style={localStyles.buttonContainer}>
                    <PrimaryButton
                        title="Save"
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        disabled={isLoading}
                    />
                </View>
            </ScrollView>

            {/* State Picker Modal */}
            <Modal
                visible={showStatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStatePicker(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={localStyles.modalOverlay}
                    onPress={() => setShowStatePicker(false)}
                >
                    <View style={localStyles.pickerContainer}>
                        <View style={localStyles.pickerHeader}>
                            <Text style={localStyles.pickerTitle}>Select State</Text>
                            <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                                <Text style={[styles.text_14_bold_mainTextColor2]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {INDIAN_STATES.map((state) => (
                                <TouchableOpacity
                                    key={state}
                                    style={localStyles.pickerOption}
                                    onPress={() => {
                                        setValue('state', state, { shouldValidate: true });
                                        setShowStatePicker(false);
                                    }}
                                >
                                    <Text style={styles.text_14_reg_mainTextColor2}>{state}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default CreateAccount;
