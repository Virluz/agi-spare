import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { heightPixel, widthPixel } from '../../utils/fonts'
import { ArrowLeft, Bell, BellDot, BellElectric, BellIcon, ChevronLeft, Heart, Menu, Search, SearchIcon, User, X } from 'lucide-react-native'
import Ripple from 'react-native-material-ripple';
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { PrimaryButton } from './PrimaryButton';
import { _getHorizontalPadding, _getVerticalPadding, calculateBounds } from '../../utils/Helper';

import FastImage from '@d11/react-native-fast-image';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

const Toolbar = ({ home,
    title, isBottomTab = false, position, mapPage = false, isSearch = false, isFilter = false, onTravel, onSearch, onFilter, filerIcon, leftButton }) => {
    const { colorScheme, userLocation, appSettings, isLoggedInGlobal } = useSelector(state => state.app);
    const wishlistCount = useSelector(state => state.wishlist?.wishlistItems?.length || 0);
    const navigation = useNavigation();
    const colorSet = AppStyles.colorSet[colorScheme];
    const localStyle = getLocalStyles(colorSet);
    const [textValue, setTextValue] = useState("");

    const [predictions, setPrediction] = useState([]);
    const [geoFenceRadius, setGeoFenceRadius] = useState(calculateBounds(userLocation, parseInt(appSettings?.ManualLocationPinRadiusMeters)));

    useEffect(() => {
        setGeoFenceRadius(calculateBounds(userLocation, parseInt(appSettings?.ManualLocationPinRadiusMeters)))
    }, [userLocation])

    // const []



    const handleMapNavigation = (placeID) => {
        if (!placeID) return;

        onSearch(placeID);

    }


    const styles = AppStyles.getAllStyles(colorScheme);

    if (isBottomTab) {
        return (
            <View style={{
                height: heightPixel(48), paddingHorizontal: widthPixel(15), backgroundColor: colorSet.mainThemeBackgroundColor,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
            }}>


                <Text style={[styles.text_24_bold_mainTextColor2]}>

                    {title}

                </Text>
                <View style={{ flexDirection: 'row', gap: widthPixel(8) }}>
                    {isSearch &&

                        <Ripple style={{ padding: widthPixel(8) }} onPress={onSearch} >

                            <SearchIcon size={widthPixel(24)} color={colorSet.black} />

                        </Ripple>
                    }

                    {isFilter &&




                        <Ripple style={{ padding: widthPixel(8), }} onPress={onFilter} >

                            {filerIcon}

                        </Ripple>

                    }

                </View>



            </View>
        )
    }

    if (home) {
        return (
            <View style={{
                // position: 'absolute',
                // zIndex: 10,
                width: '100%',
                height: heightPixel(48),
                // backgroundColor: colorSet.mainThemeBackgroundColor,
                flexDirection: 'row',
                paddingHorizontal: widthPixel(8),
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>


                <TouchableOpacity style={{ padding: widthPixel(8), zIndex: 100, }}
                // onPress={() => {
                //     console.log("asdfdas");

                //     return navigation.dispatch(DrawerActions.toggleDrawer());
                // }} 
                >


                    <FastImage
                        source={require('../../../assets/images/home/logo_round.png')}
                        style={{ width: widthPixel(42), height: heightPixel(42) }}
                        resizeMode={FastImage.resizeMode.contain}

                    />
                    {/* <Menu size={widthPixel(24)} color={colorSet.white} /> */}


                </TouchableOpacity>




                <View style={{
                    flexDirection: 'row', zIndex: 100,

                }}>

                    <Ripple style={{
                        padding: widthPixel(8),
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F4F1FB',
                        borderRadius: 100,
                        // opacity: 0.5
                    }} onPress={() => {
                        navigation.navigate('SearchPage')
                    }} >

                        <SearchIcon size={widthPixel(24)} color={'#666666'} />


                    </Ripple>

                    {_getHorizontalPadding(5)}


                    {isLoggedInGlobal && (
                        <Ripple style={{
                            position: 'relative',
                            padding: widthPixel(8),
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F4F1FB',
                            borderRadius: 100,
                            // opacity: 0.5
                        }} onPress={() => {
                            navigation.navigate('Wishlist')
                        }} >

                            <Heart size={widthPixel(24)} color={'#666666'} />

                            {wishlistCount > 0 && (
                                <View style={localStyle.wishlistBadge}>
                                    <Text style={localStyle.wishlistBadgeText}>
                                        {wishlistCount > 99 ? '99+' : wishlistCount}
                                    </Text>
                                </View>
                            )}

                        </Ripple>
                    )}






                    <Ripple style={{ padding: widthPixel(8), zIndex: 100 }}

                        onPress={() => {
                            return navigation.navigate('Notifications');
                        }} >

                        <BellIcon size={widthPixel(24)} color={'#666666'} />

                    </Ripple>

                </View>



            </View>
        )
    }

    return (
        <View style={{
            height: heightPixel(48),
            flexDirection: 'row',
            backgroundColor: colorSet.mainThemeBackgroundColor,
            alignItems: 'center',
            borderBottomColor: 'rgba(51, 51, 51, 0.3)',
            elevation: 5,
            borderBottomWidth: 0.5,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            // paddingVertical: widthPixel(16),
        }}>

            <Ripple
                style={{
                    // paddingVertical: widthPixel(16),
                    padding: 12,
                    // position: 'absolute', // Position absolutely
                    left: 0, // Stick to left
                    zIndex: 1,
                }}
                onPress={() => {
                    navigation.goBack();
                }}
            >

                <ArrowLeft size={24} color={colorSet.black} />

            </Ripple>

            <View style={{
                flex: 1,

                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                // width: '100%',
                // backgroundColor: 'red'
            }}>

                <Text style={[styles.text_14_reg_mainTextColor2]}
                    numberOfLines={1}>

                    {title}

                </Text>

                {isFilter &&
                    <Ripple style={{
                        padding: widthPixel(8),
                        paddingRight: widthPixel(16),
                    }} onPress={onFilter} >

                        {filerIcon}

                    </Ripple>

                }

            </View>





        </View>
    )
}

export default Toolbar

const getLocalStyles = (colorSet) => {
    return StyleSheet.create({
        buttonContainer: {
            height: heightPixel(40),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colorSet?.invert2,
            borderRadius: widthPixel(12),
            paddingHorizontal: widthPixel(16)
        },
        wishlistBadge: {
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: widthPixel(16),
            height: widthPixel(16),
            paddingHorizontal: widthPixel(3),
            borderRadius: widthPixel(8),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F04438',
            borderColor: '#FFFFFF',
            borderWidth: 1,
        },
        wishlistBadgeText: {
            color: '#FFFFFF',
            fontSize: widthPixel(9),
            fontWeight: '700',
            lineHeight: widthPixel(11),
        },
    });
}
