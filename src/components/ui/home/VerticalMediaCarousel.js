import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import Video from 'react-native-video';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { _getVerticalPadding, DEVICE_WIDTH } from '../../../utils/Helper';
import { heightPixel, widthPixel } from '../../../utils/fonts';
import ImageCarousel from './ImageCarousel';
import AppStyles from '../../../styles/AppStyles';
import { PrimaryButton } from '../PrimaryButton';
import { useNavigation } from '@react-navigation/native';

const mediaItems = [
    // {
    //     id: '1',
    //     type: 'video',
    //     source: require('../../../../assets/videos/AirDryreel_changes.mp4')
    // },
    {
        id: '2',
        type: 'image',
        source: require('../../../../assets/images/home/look_for_1.jpg'),
        title: 'SLEEPWEAR FOR WOMENTS',
        desc: 'Fit for office and casual wear',
        buttonText: 'SHOP DENIM',
        handle: 'sleepwear-t-shirt',
    },
    {
        id: '3',
        type: 'multiple',
        images: [
            require('../../../../assets/images/home/look_for_2.jpg'),
            require('../../../../assets/images/home/look_for_3.jpg'),
            require('../../../../assets/images/home/look_for_4.jpg')

        ],
        title: 'ATHLEISURE COLLECTION',
        desc: 'Fit for office and casual wear',
        buttonText: 'SHOP DENIM',
        handle: 'athleisure'

    },
    {
        id: '4',
        type: 'image',
        source: require('../../../../assets/images/home/look_for_5.jpg'),
        title: 'DENIM COLLECTION',
        desc: 'Fit for office and casual wear',
        buttonText: 'SHOP DENIM',
        handle: 'womens-jeans'
    },
]

const VerticalMediaCarousel = ({ }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const width = Dimensions.get('window').width;
    const navigation = useNavigation();

    const appStyles = AppStyles.getAllStyles();

    const renderItem = ({ item, index }) => {

        console.log("item", item);



        if (item?.type === 'multiple') {
            return (
                <View style={[styles.itemContainer]}>
                    <ImageCarousel images={item?.images} fullHeight showDots />

                    <View style={{
                        position: 'absolute', width: widthPixel(200),
                        left: 20, bottom: 40,
                    }}>

                        <Text style={appStyles.text_20_reg_white_secondaryFont}>

                            {item.title}

                        </Text>

                        <Text style={appStyles.text_14_reg_white}>

                            {item.desc}

                        </Text>

                        {_getVerticalPadding(16)}

                        {_getVerticalPadding(16)}

                        <PrimaryButton title={item.title} onPress={() => navigation.navigate('ProductList', { handle: item?.handle, title: item?.title })} />


                    </View>
                </View>
            )
        }

        return (
            <View style={[styles.itemContainer]}>
                {item.type === 'image' ? (
                    <Image
                        source={item.source}
                        style={styles.media}
                        resizeMode="cover"
                    />
                ) : (
                    <Video
                        source={item.source}
                        style={styles.media}
                        paused={index !== activeIndex} // Pause videos that aren't active
                        resizeMode="cover"
                        controls={false}
                        repeat={true}
                        bufferingStrategy='DependingOnMemory'
                        onError={(error) => console.error('Video Error:', error)}
                    />
                )}

                <View style={{
                    position: 'absolute', width: widthPixel(200),
                    left: 20, bottom: 20,
                }}>

                    <Text style={appStyles.text_20_reg_white_secondaryFont}>

                        {item.title}

                    </Text>

                    <Text style={appStyles.text_14_reg_white}>

                        {item.desc}

                    </Text>

                    {_getVerticalPadding(16)}

                    <PrimaryButton title={item.title} onPress={() => navigation.navigate('ProductList', { handle: item?.handle, title: item?.title })} />


                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}
            horizontal
            showsHorizontalScrollIndicator={false}
        >

            <View style={{
                height: heightPixel(450),
                flexDirection: 'row', paddingLeft: 8
            }}>
                {mediaItems.map((item, index) => renderItem({ item, index }))}

            </View>


        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    itemContainer: {
        width: DEVICE_WIDTH * 0.90,
        height: '100%',
        marginRight: 8
    },
    media: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#000',
        width: 12,
    },
});

export default VerticalMediaCarousel;