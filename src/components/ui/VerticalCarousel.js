import React from 'react';
import { View, Dimensions, Image, StyleSheet } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
    interpolate,
    useAnimatedStyle,
    Extrapolate,
    withSpring
} from 'react-native-reanimated';

const { height, width } = Dimensions.get('window');

const data = [
    { id: '1', image: 'https://picsum.photos/id/237/200/300' },
    { id: '2', image: 'https://picsum.photos/id/238/200/300' },
    { id: '3', image: 'https://picsum.photos/id/239/200/300' },
    { id: '4', image: 'https://picsum.photos/id/240/200/300' },
];

export default function VerticalCarousel() {


    return (
        <View style={styles.container}>
            <Carousel
                vertical
                width={width}
                height={height * 0.8}
                data={data}
                loop={false}
                panGestureHandlerProps={{
                    activeOffsetY: [-10, 10], // Sensitivity for vertical scroll
                }}
                scrollAnimationDuration={800}
                renderItem={({ item, index }) => {

                    return (
                        <Image
                            source={{ uri: item.image }}
                            style={[
                                styles.image,
                                index === 0 && styles.firstImage // Full screen for first item
                            ]}
                        />
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    slide: {
        position: 'absolute',
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width * 0.95,
        height: height * 0.85,
        resizeMode: 'cover',
        borderRadius: 12,
    },
    firstImage: {
        width: width,
        height: height,
        borderRadius: 0,
    },
});