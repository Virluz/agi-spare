import { Image, StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { fontPixel, widthPixel } from '../../utils/fonts';
import { _getVerticalPadding, DEVICE_WIDTH } from '../../utils/Helper';
import SectionName from '../../components/ui/home/SectionName';
import { useTranslation } from 'react-i18next';
import FastImage from '@d11/react-native-fast-image';

const Care = () => {
    const { colorScheme } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const { t } = useTranslation();

    const translateKeys = {
        styleUnionCare: t('STYLE UNION CARE'),
        customerSupport: t('24x7 CUSTOMER SUPPORT'),
        returnAndRefund: t('RETURN & REFUND POLICY'),
        securePaymentSystem: t('SECURE PAYMENT SYSTEM')
    }

    const cards = [
        {
            id: '1',
            image: require('../../../assets/images/home/headphone.png'),
            text: translateKeys.customerSupport,
        },
        {
            id: '2',
            image: require('../../../assets/images/home/return.png'),
            text: translateKeys.returnAndRefund,
        },
        {
            id: '3',
            image: require('../../../assets/images/home/biometric.png'),
            text: translateKeys.securePaymentSystem,
        },
    ]

    return (
        <ScrollView
            style={styles.container_no_padding}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={localStyles.scrollContent}
        >
            {_getVerticalPadding(30)}

            <View style={localStyles.contentContainer}>
                <SectionName title={translateKeys.styleUnionCare} size={fontPixel(32)} />

                {_getVerticalPadding(10)}

                <View style={localStyles.featuresRow}>

                    {cards.map((item, index) => {
                        return (
                            <View style={localStyles.featureContainer} key={index.toString()}>
                                <FastImage
                                    source={item.image}
                                    style={localStyles.featureImage}
                                    resizeMode='contain'
                                />
                                {_getVerticalPadding(10)}
                                <Text style={[styles.text_10_reg_mainTextColor2, localStyles.featureText]}>
                                    {item.text}
                                </Text>
                            </View>
                        )
                    })}

                </View>

                {_getVerticalPadding(16)}

                <Text style={[styles.text_12_reg_dark3, localStyles.footerText]}>
                    © 2025 Style Union. V2
                </Text>

                {_getVerticalPadding(16)}
            </View>
        </ScrollView>
    )
}

export default Care

const localStyles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: widthPixel(16),
    },
    featuresRow: {
        flexDirection: 'row',
        gap: widthPixel(10),
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        flex: 1,
    },
    featureContainer: {
        paddingVertical: widthPixel(16),
        // backgroundColor: '#F2F2F2',
        flex: 1, // Accounting for padding and gaps
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: widthPixel(24),
        // borderWidth: 1,
        // borderColor: '#F2F2F2',
    },
    featureImage: {
        width: widthPixel(18),
        height: widthPixel(18),
        resizeMode: 'contain',
    },
    featureText: {
        textAlign: 'center',
        paddingHorizontal: widthPixel(5),
    },
    footerText: {
        textAlign: 'center',
    }
});