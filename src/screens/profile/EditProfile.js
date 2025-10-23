import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Platform, ActionSheetIOS, Modal } from 'react-native';
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateCustomerProfile, createCustomerAddress, updateCustomerAddress, setCustomerDefaultAddress, saveCustomerExtras, setCustomerMetafieldsAdmin, updateCustomerMetafieldsAdmin } from '../../graphql/graph_request';
import CommonInput from '../../components/ui/CommonInput';
import { ChevronLeft, Edit, Calendar, MapPin, Phone, Mail, User, ChevronDown } from 'lucide-react-native';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { _getVerticalPadding, EMAIL_REGEX, NUMBER_REGX } from '../../utils/Helper';
import Ripple from "react-native-material-ripple";
import Toolbar from '../../components/ui/Toolbar';
import { checkCustomerAuth } from '../../graphql/customerAuth';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';


const EditProfile = () => {
    const { colorScheme } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme];
    const styles = AppStyles.getAllStyles(colorScheme);
    const navigation = useNavigation();

    const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            gender: '',
            dob: '',
            email: '',
            phone: '',
            address1: '',
            address2: '',
            city: '',
            province: '',
            zip: '',
            country: '',
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

    const formatDateForDisplay = useCallback((date) => {
        try {
            if (!(date instanceof Date)) return '';
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const yyyy = date.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
        } catch {
            return '';
        }
    }, []);

    // Fetch current customer data on mount
    useEffect(() => {
        loadCustomerData();
    }, []);

    const loadCustomerData = async () => {
        try {
            const token = await AsyncStorage.getItem('customerAccessToken');
            const savedAvatar = await AsyncStorage.getItem('customerAvatarUri');
            if (savedAvatar) setAvatarUri(savedAvatar);

            if (!token) return;
            const customer = await checkCustomerAuth();
            if (customer) {
                const initial = {
                    firstName: customer.firstName || '',
                    lastName: customer.lastName || '',
                    email: customer.email || '',
                    phone: customer.phone || '',
                };
                Object.entries(initial).forEach(([key, value]) => setValue(key, value));

                // Prefill default address if available
                if (customer.defaultAddress) {
                    const a = customer.defaultAddress;
                    setValue('address1', a.address1 || '');
                    setValue('address2', a.address2 || '');
                    setValue('city', a.city || '');
                    setValue('province', a.province || '');
                    setValue('zip', a.zip || '');
                    setValue('country', a.country || '');
                }

                // Prefill gender/dob: prefer facts namespace (metafields array may contain nulls)
                const _metas = Array.isArray(customer.metafields) ? customer.metafields.filter(Boolean) : [];
                const gMeta = _metas.find(m => m && m.key === 'gender')?.value; // facts.gender
                const dMeta = _metas.find(m => m && m.key === 'birth_date')?.value; // facts.birth_date
                if (gMeta) setValue('gender', gMeta);
                if (dMeta) {
                    try {
                        const d = new Date(dMeta);
                        if (!isNaN(d.getTime())) {
                            setSelectedDate(d);
                            setValue('dob', formatDateForDisplay(d));
                        } else {
                            setValue('dob', dMeta);
                        }
                    } catch { setValue('dob', dMeta); }
                }
                if (!gMeta || !dMeta) {
                    const extrasRaw = await AsyncStorage.getItem('customerProfileExtras');
                    if (extrasRaw) {
                        const extras = JSON.parse(extrasRaw);
                        if (!gMeta && extras.gender) setValue('gender', extras.gender);
                        if (!dMeta && extras.dob) {
                            try {
                                const d = new Date(extras.dob);
                                if (!isNaN(d.getTime())) {
                                    setSelectedDate(d);
                                    setValue('dob', formatDateForDisplay(d));
                                } else {
                                    setValue('dob', extras.dob);
                                }
                            } catch { setValue('dob', extras.dob); }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading customer data:', error);
        }
    };

    const pickFromLibrary = useCallback(() => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (res) => {
            if (res.didCancel || res.errorCode) return;
            const uri = res.assets?.[0]?.uri;
            if (uri) {
                setAvatarUri(uri);
                await AsyncStorage.setItem('customerAvatarUri', uri);
            }
        });
    }, []);

    const pickFromCamera = useCallback(() => {
        launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false }, async (res) => {
            if (res.didCancel || res.errorCode) return;
            const uri = res.assets?.[0]?.uri;
            if (uri) {
                setAvatarUri(uri);
                await AsyncStorage.setItem('customerAvatarUri', uri);
            }
        });
    }, []);

    const onPressEditAvatar = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Choose from Library', 'Take Photo'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) pickFromLibrary();
                    else if (buttonIndex === 2) pickFromCamera();
                }
            );
        } else {
            Alert.alert(
                'Update Avatar',
                'Select image source',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Library', onPress: pickFromLibrary },
                    { text: 'Camera', onPress: pickFromCamera },
                ]
            );
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const customerAccessToken = await AsyncStorage.getItem('customerAccessToken');

            if (!customerAccessToken) {
                Alert.alert('Error', 'Please login to update your profile');
                return;
            }

            const customerData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                acceptsMarketing: true,
            };

            const response = await updateCustomerProfile(customerAccessToken, customerData);

            if (response.customerUpdate.customerUserErrors?.length > 0) {
                const error = response.customerUpdate.customerUserErrors[0];
                Alert.alert('Error', error.message);
                return;
            }

            // Address handling: create or update default address
            const addressInput = {
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                address1: data.address1,
                address2: data.address2 || undefined,
                city: data.city,
                province: data.province,
                zip: data.zip,
                country: data.country,
                phone: data.phone || undefined,
            };

            // Try to update existing default address if present; otherwise create
            const customer = await checkCustomerAuth();
            let addressId = customer?.defaultAddress?.id;
            if (addressId) {
                const upd = await updateCustomerAddress(customerAccessToken, addressId, addressInput);
                if (upd.customerAddressUpdate.customerUserErrors?.length) {
                    const e = upd.customerAddressUpdate.customerUserErrors[0];
                    throw new Error(e.message);
                }
            } else {
                const crt = await createCustomerAddress(customerAccessToken, addressInput);
                if (crt.customerAddressCreate.customerUserErrors?.length) {
                    const e = crt.customerAddressCreate.customerUserErrors[0];
                    throw new Error(e.message);
                }
                addressId = crt.customerAddressCreate.customerAddress?.id;
                if (addressId) {
                    await setCustomerDefaultAddress(customerAccessToken, addressId);
                }
            }

            // Gender and DOB: update via Admin customerUpdate (metafields) and store locally
            if (data.gender || data.dob) {
                const customerForExtras = customer || (await checkCustomerAuth());
                const customerId = customerForExtras?.id;
                // Save to local immediately
                await AsyncStorage.setItem('customerProfileExtras', JSON.stringify({ gender: data.gender || '', dob: data.dob || '' }));

                // Build metafields payload for Admin customerUpdate
                const toISO = (val) => {
                    try {
                        if (!val) return null;
                        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
                        const [mm, dd, yyyy] = String(val).split('/');
                        const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
                        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
                        return null;
                    } catch { return null; }
                };
                const metas = [];
                if (data.gender) metas.push({ namespace: 'facts', key: 'gender', value: String(data.gender), type: 'single_line_text_field' });
                if (data.dob) {
                    const iso = toISO(data.dob);
                    if (iso) metas.push({ namespace: 'facts', key: 'birth_date', value: iso, type: 'date' });
                    else metas.push({ namespace: 'facts', key: 'birth_date', value: String(data.dob), type: 'single_line_text_field' });
                }
                try {
                    if (customerId && metas.length) {
                        await updateCustomerMetafieldsAdmin(customerId, metas);
                    }
                } catch (e) {
                    console.warn('Admin metafield update failed:', e?.message || e);
                }
            }


            Alert.alert('Success', 'Profile and address updated');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const localStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colorSet.mainThemeBackgroundColor,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            // paddingHorizontal: widthPixel(15),
            paddingVertical: heightPixel(10),
            borderBottomWidth: 0.5,
            borderBottomColor: colorSet.light,
            backgroundColor: colorSet.mainThemeBackgroundColor,
        },
        headerTitle: {
            ...styles.text_16_bold_mainTextColor2,
            marginLeft: widthPixel(10),
        },
        profileSection: {
            alignItems: 'center',
            paddingVertical: heightPixel(20),
        },
        avatarContainer: {
            width: widthPixel(100),
            height: widthPixel(100),
            borderRadius: widthPixel(50),
            backgroundColor: colorSet.light,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarPlaceholder: {
            width: widthPixel(60),
            height: widthPixel(60),
            tintColor: colorSet.dark3,
        },
        editIconContainer: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: colorSet.red,
            borderRadius: widthPixel(15),
            padding: widthPixel(5),
        },
        sectionTitle: {
            ...styles.text_16_bold_mainTextColor2,
            // paddingHorizontal: widthPixel(15),
            marginTop: heightPixel(20),
            marginBottom: heightPixel(10),
        },
        inputContainer: {
            // paddingHorizontal: widthPixel(15),
            // marginBottom: heightPixel(8),
        },
        continueButton: {
            marginHorizontal: widthPixel(15),
            marginVertical: heightPixel(20),
        },
        pickerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: heightPixel(42),
            borderWidth: 1,
            borderColor: '#DEDEDE',
            paddingHorizontal: 12,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        pickerContainer: {
            backgroundColor: colorSet.white,
            borderTopLeftRadius: widthPixel(8),
            borderTopRightRadius: widthPixel(8),
            paddingBottom: heightPixel(30),
        },
        pickerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: widthPixel(20),
            paddingVertical: heightPixel(15),
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
        },
        pickerTitle: {
            ...styles.text_16_bold_mainTextColor2,
        },
        pickerOption: {
            paddingVertical: heightPixel(15),
            paddingHorizontal: widthPixel(20),
            borderBottomWidth: 1,
            borderBottomColor: '#F0F0F0',
        },
    });

    return (
        <>
            <Toolbar title="Edit Profile" />

            <View style={styles.container}>

                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

                    <View style={localStyles.profileSection}>
                        <View style={localStyles.avatarContainer}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%', borderRadius: widthPixel(50) }} />
                            ) : (
                                <User size={widthPixel(60)} color={colorSet.dark3} />
                            )}
                            <TouchableOpacity style={localStyles.editIconContainer} onPress={onPressEditAvatar}>
                                <Edit size={widthPixel(15)} color={colorSet.white} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.text_14_reg_mainTextColor2}>Personal Information</Text>
                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="firstName"
                            placeholder="Mukesh"
                            label="First Name"
                            control={control}
                            errors={errors}
                            rules={{ required: true }}
                            errorMessage="First name is required."
                        />
                    </View>

                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="lastName"
                            placeholder="Kumar"
                            label="Last Name"
                            control={control}
                            errors={errors}
                            rules={{ required: true }}
                            errorMessage="Last name is required."
                        />
                    </View>

                    {_getVerticalPadding(8)}
                    <View style={localStyles.inputContainer}>
                        {/* <Text style={[styles.text_14_reg_mainTextColor2, { marginBottom: 4 }]}>Gender</Text> */}
                        <Controller
                            name="gender"
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { value } }) => (
                                <TouchableOpacity style={localStyles.pickerButton} onPress={() => setShowGenderPicker(true)}>
                                    <Text style={[styles.text_14_reg_mainTextColor2, !value && { color: '#A0A0A0' }]}>
                                        {value || 'Select Gender'}
                                    </Text>
                                    <ChevronDown size={widthPixel(20)} color={colorSet.dark3} />
                                </TouchableOpacity>
                            )}
                        />
                        {errors?.gender && (
                            <Text style={{ color: 'red', marginTop: 4 }}>Gender is required.</Text>
                        )}
                    </View>

                    {_getVerticalPadding(8)}

                    <View style={localStyles.inputContainer}>
                        {/* <Text style={[styles.text_14_reg_mainTextColor2, { marginBottom: 4 }]}>Date of Birth</Text> */}
                        <Controller
                            name="dob"
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { value } }) => (
                                <TouchableOpacity style={localStyles.pickerButton} onPress={() => setShowDatePicker(true)}>
                                    <Text style={[styles.text_14_reg_mainTextColor2, !value && { color: '#A0A0A0' }]}>
                                        {value || 'MM/DD/YYYY'}
                                    </Text>
                                    <Calendar size={widthPixel(20)} color={colorSet.dark3} />
                                </TouchableOpacity>
                            )}
                        />
                        {errors?.dob && (
                            <Text style={{ color: 'red', marginTop: 4 }}>Date of Birth is required.</Text>
                        )}
                    </View>

                    {_getVerticalPadding(8)}

                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="email"
                            placeholder="starkashok100@gmail.com"
                            label="Email"
                            rightIcon={<Edit size={widthPixel(20)} color={colorSet.dark3} />}
                            control={control}
                            errors={errors}
                            rules={{ required: true, pattern: EMAIL_REGEX }}
                            errorMessage="Invalid email address."
                        />
                    </View>

                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="phone"
                            placeholder="+91 8092543066"
                            label="Phone Number"
                            rightIcon={<Edit size={widthPixel(20)} color={colorSet.dark3} />}

                            control={control}
                            errors={errors}
                            rules={{
                                required: true,
                                // pattern: NUMBER_REGX
                            }}
                            errorMessage="Invalid phone number."
                        />
                    </View>

                    <Text style={styles.text_14_reg_mainTextColor2}>Address</Text>
                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="address1"
                            placeholder="Address line 1"
                            label="Address 1"
                            rightIcon={<MapPin size={widthPixel(20)} color={colorSet.dark3} />}
                            control={control}
                            errors={errors}
                            rules={{ required: true }}
                            errorMessage="Address 1 is required."
                        />
                    </View>
                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="address2"
                            placeholder="Apartment, suite, etc. (optional)"
                            label="Address 2"
                            control={control}
                            errors={errors}
                            rules={{}}
                            errorMessage=""
                        />
                    </View>
                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="city"
                            placeholder="City"
                            label="City"
                            control={control}
                            errors={errors}
                            rules={{ required: true }}
                            errorMessage="City is required."
                        />
                    </View>
                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="province"
                            placeholder="State/Province"
                            label="State/Province"
                            control={control}
                            errors={errors}
                            rules={{ required: true }}
                            errorMessage="State/Province is required."
                        />
                    </View>
                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="zip"
                            placeholder="Postal/ZIP code"
                            label="ZIP/Postal Code"
                            control={control}
                            errors={errors}
                            rules={{ required: true }}
                            errorMessage="ZIP/Postal Code is required."
                        />
                    </View>
                    <View style={localStyles.inputContainer}>
                        <CommonInput
                            name="country"
                            placeholder="India"
                            label="Country"
                            control={control}
                            errors={errors}
                            rules={{ required: true }}
                            errorMessage="Country is required."
                        />
                    </View>


                    <PrimaryButton
                        title={isLoading ? "UPDATING..." : "SAVE CHANGES"}
                        onPress={handleSubmit(onSubmit)}
                        style={localStyles.continueButton}
                        disabled={isLoading}
                    />

                    {_getVerticalPadding(40)}
                </ScrollView>

            </View>

            {/* Gender Picker Modal */}
            <Modal visible={showGenderPicker} transparent animationType="fade" onRequestClose={() => setShowGenderPicker(false)}>
                <TouchableOpacity activeOpacity={1} style={localStyles.modalOverlay} onPress={() => setShowGenderPicker(false)}>
                    <View style={localStyles.pickerContainer}>
                        <View style={localStyles.pickerHeader}>
                            <Text style={styles.text_16_semi_mainTextColor2}>Select Gender</Text>
                            <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                                <Text style={[styles.text_16_semi_mainTextColor2]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        {GENDER_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={localStyles.pickerOption}
                                onPress={() => {
                                    setValue('gender', opt, { shouldDirty: true, shouldValidate: true });
                                    setShowGenderPicker(false);
                                }}
                            >
                                <Text style={styles.text_14_reg_mainTextColor2}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Date Picker Modal / Inline */}
            {Platform.OS === 'android' ? (
                showDatePicker ? (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        onChange={(event, date) => {
                            // Android emits 'set' or 'dismissed'
                            setShowDatePicker(false);
                            if (event.type === 'set' && date) {
                                setSelectedDate(date);
                                const disp = formatDateForDisplay(date);
                                setValue('dob', disp, { shouldDirty: true, shouldValidate: true });
                            }
                        }}
                    />
                ) : null
            ) : (
                <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                    <TouchableOpacity activeOpacity={1} style={localStyles.modalOverlay} onPress={() => setShowDatePicker(false)}>
                        <View style={localStyles.pickerContainer}>
                            <View style={localStyles.pickerHeader}>
                                <Text style={localStyles.pickerTitle}>Select Date</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        const disp = formatDateForDisplay(selectedDate);
                                        setValue('dob', disp, { shouldDirty: true, shouldValidate: true });
                                        setShowDatePicker(false);
                                    }}
                                >
                                    <Text style={[styles.text_14_bold_mainTextColor2]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="spinner"
                                maximumDate={new Date()}
                                onChange={(event, date) => {
                                    if (date) setSelectedDate(date);
                                }}
                                style={{ alignSelf: 'stretch' }}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </>
    );
};

export default EditProfile;

// Modals for pickers (outside component return to keep code local)
// Note: We render conditionally below the main content for clarity