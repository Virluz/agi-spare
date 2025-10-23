import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import FastImage from '@d11/react-native-fast-image';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { _getVerticalPadding, DEVICE_WIDTH } from '../../utils/Helper';
import { Heart, ArrowRight } from 'lucide-react-native';

// Placeholder data
const showcaseBanner = require('../../../assets/images/home/store_photo.png');
const showcaseModel = require('../../../assets/images/category/mens.png');

const categoriesHorizontal = [
    { id: 'c1', title: 'T-Shirts' },
    { id: 'c2', title: 'Shirts' },
    { id: 'c3', title: 'Denim' },
    { id: 'c4', title: 'Athleisure' },
    { id: 'c5', title: 'Accessories' },
];

const productPlaceholders = Array.from({ length: 6 }).map((_, i) => ({ id: 'p' + i, title: 'Product ' + (i + 1) }));

const NewInScreen = () => {
    const { colorScheme } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];

    const renderCategoryChip = ({ item }) => (
        <TouchableOpacity style={[localStyles.chip, { borderColor: colorSet.primaryColor }]}>
            <Text style={styles.text_12_reg_mainTextColor2}>{item.title}</Text>
        </TouchableOpacity>
    );

    const renderProductCard = ({ item }) => (
        <View style={localStyles.productCard}>
            <FastImage source={showcaseBanner} style={localStyles.productImage} resizeMode="cover" />
            <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 4 }]}>{item.title}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <Toolbar title={'New In'} />
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={localStyles.bannerWrapper}>
                    <FastImage
                        source={showcaseBanner}
                        style={localStyles.banner}
                        resizeMode="contain"
                    >
                        <Text style={[styles.text_24_reg_white_secondaryFont]}>NEW IN</Text>
                        <Text style={[styles.text_14_reg_white_secondaryFont, { maxWidth: '70%', marginTop: 4 }]}>Latest drops & fresh arrivals curated for you.</Text>
                        <TouchableOpacity style={localStyles.bannerCta}>
                            <Text style={[styles.text_12_semi_white_camton]}>Shop Now</Text>
                            <ArrowRight size={16} color={colorSet.white} />
                        </TouchableOpacity>
                        <View style={localStyles.modelImageHolder}>
                            <FastImage source={showcaseModel} style={{ height: '100%', width: '100%' }} resizeMode='contain' />
                        </View>
                    </FastImage>
                </View>

                {_getVerticalPadding(10)}

                <View style={{ paddingHorizontal: widthPixel(16) }}>
                    <Text style={styles.text_16_semi_mainTextColor2}>Browse Categories</Text>
                    {_getVerticalPadding(8)}
                    <FlatList
                        horizontal
                        data={categoriesHorizontal}
                        renderItem={renderCategoryChip}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                        contentContainerStyle={{ paddingVertical: 4 }}
                    />
                </View>

                {_getVerticalPadding(16)}

                <View style={{ paddingHorizontal: widthPixel(16), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.text_16_semi_mainTextColor2}>Just Dropped</Text>
                    <TouchableOpacity>
                        <Text style={[styles.text_12_reg_mainTextColor2, { textDecorationLine: 'underline' }]}>View All</Text>
                    </TouchableOpacity>
                </View>

                {_getVerticalPadding(10)}

                <FlatList
                    data={productPlaceholders}
                    renderItem={renderProductCard}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: widthPixel(16) }}
                    contentContainerStyle={{ paddingBottom: heightPixel(40) }}
                />
            </ScrollView>
        </View>
    );
};

const CARD_WIDTH = (DEVICE_WIDTH - widthPixel(16) * 2 - 12) / 2;

const localStyles = StyleSheet.create({
    bannerWrapper: {
        alignItems: 'center',
        paddingHorizontal: widthPixel(16),
    },
    banner: {
        width: '100%',
        height: heightPixel(200),
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        padding: widthPixel(16),
        backgroundColor: '#222'
    },
    modelImageHolder: {
        position: 'absolute',
        height: '110%',
        width: widthPixel(160),
        right: 0,
        bottom: 0,
    },
    bannerCta: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start'
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        backgroundColor: 'transparent'
    },
    productCard: {
        width: CARD_WIDTH,
        marginBottom: 12,
    },
    productImage: {
        width: '100%',
        height: heightPixel(140),
        borderRadius: 8,
        backgroundColor: '#eee'
    }
});

export default NewInScreen;
