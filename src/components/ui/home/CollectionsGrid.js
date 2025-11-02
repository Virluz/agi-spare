import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FastImage from '@d11/react-native-fast-image';
import AppStyles from '../../../styles/AppStyles';
import { heightPixel, widthPixel } from '../../../utils/fonts';
import { DEVICE_WIDTH } from '../../../utils/Helper';

const CollectionsGrid = ({ collections, title = "Categories" }) => {
    const { colorScheme } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const navigation = useNavigation();

    console.log('CollectionsGrid: Received collections:', collections);
    console.log('CollectionsGrid: Collections type:', typeof collections);
    console.log('CollectionsGrid: Is collections array:', Array.isArray(collections));

    // Define category colors similar to the UI image
    const categoryColors = [
        '#4A4A68', // Purple/Navy
        '#4A4A68', // Purple/Navy  
        '#4A4A68', // Purple/Navy
        '#4A4A68', // Purple/Navy
        '#4A4A68', // Purple/Navy
        '#4A4A68', // Purple/Navy
    ];

    // Get default icon based on collection name
    const getDefaultIcon = (title) => {
        const titleLower = title.toLowerCase();

        if (titleLower.includes('men') || titleLower.includes('male')) {
            return require('../../../../assets/images/category/mens.png');
        } else if (titleLower.includes('women') || titleLower.includes('female') || titleLower.includes('ladies')) {
            return require('../../../../assets/images/category/women_full.png');
        } else if (titleLower.includes('kid') || titleLower.includes('child')) {
            return require('../../../../assets/images/category/kids_full.png');
        }

        // Default fallback icon
        return require('../../../../assets/images/categories.png');
    };

    const renderCollectionItem = ({ item, index }) => {
        const backgroundColor = categoryColors[index % categoryColors.length];

        return (
            <TouchableOpacity
                style={[localStyles.collectionItem, { backgroundColor }]}
                onPress={() => {
                    try {
                        console.log('CollectionsGrid: Navigating with item:', item);
                        console.log('CollectionsGrid: Handle:', item.handle, 'Title:', item.title);

                        // Navigate to collection products
                        navigation.navigate('ProductList', {
                            handle: item.handle,
                            title: item.title
                        });
                    } catch (error) {
                        console.error('Navigation error:', error);
                    }
                }}
            >
                <View style={localStyles.iconContainer}>
                    {item.image?.url ? (
                        <FastImage
                            source={{ uri: item.image.url }}
                            style={localStyles.collectionIcon}
                            resizeMode="contain"
                        />
                    ) : (
                        // Use default icon based on collection name
                        <Image
                            source={getDefaultIcon(item.title)}
                            style={localStyles.collectionIcon}
                            resizeMode="contain"
                        />
                    )}
                </View>
                <Text
                    style={[localStyles.collectionText]}
                    numberOfLines={2}
                >
                    {item.title.toUpperCase()}
                </Text>
            </TouchableOpacity>
        );
    };

    if (!collections || collections.length === 0) {
        return (
            <View style={localStyles.container}>
                <Text style={[styles.text_18_semi_mainTextColor2, localStyles.title]}>
                    {title}
                </Text>
                <View style={localStyles.emptyContainer}>
                    <Text style={[styles.text_14_reg_mainTextColor2, localStyles.emptyText]}>
                        No collections available at the moment
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={localStyles.container}>
            <Text style={[styles.text_18_semi_mainTextColor2, localStyles.title]}>
                {title}
            </Text>
            <FlatList
                data={collections}
                renderItem={renderCollectionItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={localStyles.grid}
                columnWrapperStyle={localStyles.row}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        marginVertical: heightPixel(20),
        // paddingHorizontal: widthPixel(16),
    },
    title: {
        textAlign: 'center',
        marginBottom: heightPixel(24),
        color: '#4A4A68',
        fontWeight: '700',
        fontSize: heightPixel(20),
    },
    grid: {
        paddingHorizontal: widthPixel(8),
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: heightPixel(16),
    },
    collectionItem: {
        width: (DEVICE_WIDTH - widthPixel(64)) / 2,
        height: heightPixel(100),
        borderRadius: widthPixel(16),
        padding: widthPixel(16),
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        flexDirection: 'row',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    collectionIcon: {
        width: widthPixel(40),
        height: widthPixel(40),
        tintColor: 'white',
    },
    collectionText: {
        color: 'white',
        fontSize: heightPixel(14),
        fontWeight: '700',
        textAlign: 'left',
        flex: 1,
        marginLeft: widthPixel(12),
        alignSelf: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: heightPixel(40),
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.6,
    },
});

export default CollectionsGrid;