import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, FlatList, Animated, TouchableOpacity } from 'react-native';
import AppStyles from '../../styles/AppStyles';
import { _getVerticalPadding, DEVICE_HEIGHT } from '../../utils/Helper';
import { heightPixel } from '../../utils/fonts';
import { useNavigation } from '@react-navigation/native';
import SecureStorage from '../../utils/SecureStorage';

const { width } = Dimensions.get('window');

const CAROUSEL_DATA = [
    {
        key: '1',
        image: require('../../../assets/images/onboard/first.png'),
        title: 'STYLE THAT COMMUNICATES ON ITS OWN',
        highlight: 'STYLE',
        description: 'Craft a wardrobe that blends elegance with comfort, highlighting your unique style',
    },
    {
        key: '2',
        image: require('../../../assets/images/onboard/second.png'),
        title: 'STYLE IS MORE THAN JUST APPEARANCE',
        highlight: 'STYLE',
        description: 'Craft a wardrobe that blends elegance with comfort, highlighting your unique style',
    },
    {
        key: '3',
        image: require('../../../assets/images/onboard/third.png'),
        title: 'STYLE THAT MAKES ITS OWN STATEMENT',
        highlight: 'STYLE',
        description: 'Craft a wardrobe that blends elegance with comfort, highlighting your unique style',
    },
];

const OnboardCarousel = () => {
    const styles = AppStyles.getAllStyles();
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigation = useNavigation();



    const renderItem = ({ item, index }) => (
        <View style={localStyles.slide}>
            <Image
                source={item.image}
                style={localStyles.imagesContainer}
            // resizeMode='contain'
            />
            <Text style={[styles.text_32_bold_mainTextColor2_secondary, { textAlign: 'center', marginHorizontal: 32 }]}>
                <Text style={styles.text_32_bold_primary_secondary}>{item.highlight}</Text>
                {item?.title?.replace(item.highlight, '')}
            </Text>

            {_getVerticalPadding(8)}

            <Text style={[styles.text_14_reg_mainTextColor2, { textAlign: 'center' }]}>
                Craft a wardrobe that blends elegance with comfort, highlighting your unique <Text style={styles.text_14_reg_primary}>style</Text>
            </Text>
        </View>
    );

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    return (
        <View style={localStyles.container}>
            <FlatList
                data={CAROUSEL_DATA}
                renderItem={renderItem}
                keyExtractor={item => item.key}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            />
            <View style={localStyles.dotsRow}>
                {CAROUSEL_DATA.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            localStyles.dot,
                            currentIndex === i ? localStyles.dotActive : null,
                        ]}
                    />
                ))}
            </View>
            {currentIndex === CAROUSEL_DATA.length - 1 && (
                <TouchableOpacity
                    style={localStyles.cta}
                    onPress={async () => {
                        await SecureStorage.setHasSeenOnboard('true');
                        // navigation.reset({ index: 0, routes: [{ name: 'MainStack' }] });

                        navigation.navigate('Login');
                    }}
                >
                    <Text style={localStyles.ctaText}>Get Started</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    slide: {
        width: width,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
        // backgroundColor: 'red',
    },
    imagesContainer: {
        marginBottom: 32,
        width: width,
        // height: heightPixel(400),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    slideImagesRow: {
        flex: 1,
        flexDirection: 'row',
        width: width,
        height: width * 0.7,
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
    },
    bigImage: {
        width: width * 0.48,
        height: width * 0.58,
        borderRadius: 18,
        position: 'absolute',
        zIndex: 2,
    },
    smallImage: {
        width: width * 0.32,
        height: width * 0.32,
        borderRadius: 16,
        position: 'absolute',
        zIndex: 1,
    },
    textContainer: {
        // marginTop: 12,
        // alignItems: 'center',
        // paddingHorizontal: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 12,
        letterSpacing: 0.2,
    },
    highlight: {
        color: '#E9003F',
        fontWeight: 'bold',
        fontSize: 22,
    },
    description: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
        marginTop: 0,
    },
    highlightDesc: {
        color: '#E9003F',
        fontWeight: 'bold',
    },
    dotsRow: {
        height: 40,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop: 16,
    },
    cta: {
        alignSelf: 'center',
        backgroundColor: '#C1272D',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 24,
    },
    ctaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#222',
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});

export default OnboardCarousel;
