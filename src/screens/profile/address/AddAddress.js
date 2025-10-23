import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppStyles from '../../../styles/AppStyles';
import Toolbar from '../../../components/ui/Toolbar';
import CommonInput from '../../../components/ui/CommonInput';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { widthPixel, heightPixel } from '../../../utils/fonts';
import { Controller, useForm } from 'react-hook-form';
import { createCustomerAddress, setCustomerDefaultAddress } from '../../../graphql/graph_request';
import { _getVerticalPadding } from '../../../utils/Helper';

const AddAddress = ({ navigation }) => {
    const { colorScheme } = useSelector((state) => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            address1: '',
            address2: '',
            city: '',
            province: '',
            zip: '',
            country: '',
            phone: '',
            makeDefault: true,
        }
    });

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('customerAccessToken');
            if (!token) {
                Alert.alert('Login required', 'Please login to add an address.');
                return;
            }
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

            const res = await createCustomerAddress(token, addressInput);
            const errs = res?.customerAddressCreate?.customerUserErrors;
            if (errs && errs.length) {
                Alert.alert('Error', errs[0].message || 'Failed to add address');
                return;
            }
            const newId = res?.customerAddressCreate?.customerAddress?.id;
            if (newId && data.makeDefault) {
                await setCustomerDefaultAddress(token, newId);
            }
            Alert.alert('Success', 'Address added successfully');
            navigation.goBack();
        } catch (e) {
            console.error('Add address failed:', e);
            Alert.alert('Error', 'Failed to add address');
        } finally {
            setIsLoading(false);
        }
    };

    const Section = ({ name, label, placeholder, rules, keyboardType }) => (
        <View style={{}}>
            <CommonInput
                name={name}
                label={label}
                placeholder={placeholder}
                control={control}
                errors={errors}
                rules={rules}
                keyboardType={keyboardType}
                errorMessage={`${label} is required.`}
            />
        </View>
    );

    return (
        <View style={styles.container_no_padding}>
            <Toolbar title="Add Address" />
            <ScrollView style={{ paddingHorizontal: widthPixel(15), paddingTop: heightPixel(10) }}>
                <Section name="firstName" label="First Name" placeholder="John" rules={{}} />
                <Section name="lastName" label="Last Name" placeholder="Doe" rules={{}} />
                <Section name="address1" label="Address 1" placeholder="123 Main St" rules={{ required: true }} />
                <Section name="address2" label="Address 2" placeholder="Apartment, suite, etc. (optional)" rules={{}} />
                <Section name="city" label="City" placeholder="Mumbai" rules={{ required: true }} />
                <Section name="province" label="State/Province" placeholder="Maharashtra" rules={{ required: true }} />
                <Section name="zip" label="ZIP/Postal Code" placeholder="400001" rules={{ required: true }} keyboardType="numbers-and-punctuation" />
                <Section name="country" label="Country" placeholder="India" rules={{ required: true }} />
                <Section name="phone" label="Phone" placeholder="+91 90000 00000" rules={{}} keyboardType="phone-pad" />

                <PrimaryButton
                    title={isLoading ? 'SAVING...' : 'SAVE ADDRESS'}
                    onPress={handleSubmit(onSubmit)}
                    style={{ marginVertical: heightPixel(20) }}
                    disabled={isLoading}
                />

                {_getVerticalPadding(30)}
            </ScrollView>
        </View>
    );
};

export default AddAddress;
