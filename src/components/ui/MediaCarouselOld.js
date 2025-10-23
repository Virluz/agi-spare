import React, { useState, useRef, useEffect } from 'react';
import { View, Dimensions, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Video from 'react-native-video';
import { FlatList } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MediaCarousel = ({ items, autoPlay = true, interval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const videoRefs = useRef({});

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay || items.length <= 1) return;

        const timer = setInterval(() => {
            const nextIndex = (currentIndex + 1) % items.length;
            goToIndex(nextIndex);
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, items.length, autoPlay, interval]);

    // Pause videos when not in view
    useEffect(() => {
        Object.keys(videoRefs.current).forEach(key => {
            if (videoRefs.current[key] && parseInt(key) !== currentIndex) {
                videoRefs.current[key].setNativeProps({ paused: true });
            }
        });
    }, [currentIndex]);

    const goToIndex = (index) => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const renderItem = ({ item, index }) => {
        return (
            <View style={styles.slide}>
                {item.type === 'video' ? (
                    <Video
                        ref={ref => videoRefs.current[index] = ref}
                        source={{ uri: item.url }}
                        style={styles.media}
                        resizeMode="cover"
                        repeat={true}
                        paused={index !== currentIndex}
                        muted={false}
                        controls={false}
                    />
                ) : (
                    <Image source={{ uri: item.url }} style={styles.media} resizeMode="cover" />
                )}
            </View>
        );
    };

    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={items}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            />

            {/* Pagination indicators */}
            <View style={styles.pagination}>
                {items.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index && styles.activeDot,
                            items[index].type === 'video' && styles.videoDot
                        ]}
                        onPress={() => goToIndex(index)}
                    />
                ))}
            </View>

            {/* Navigation arrows */}
            {items.length > 1 && (
                <>
                    <TouchableOpacity
                        style={[styles.arrow, styles.leftArrow]}
                        onPress={() => goToIndex((currentIndex - 1 + items.length) % items.length)}
                    >
                        {/* <AntDesign name="left" size={24} color="white" /> */}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.arrow, styles.rightArrow]}
                        onPress={() => goToIndex((currentIndex + 1) % items.length)}
                    >
                        {/* <AntDesign name="right" size={24} color="white" /> */}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 300, // Adjust based on your needs
        position: 'relative',
    },
    slide: {
        width: SCREEN_WIDTH,
        height: '100%',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
        margin: 5,
    },
    activeDot: {
        backgroundColor: 'white',
    },
    videoDot: {
        borderWidth: 1,
        borderColor: 'white',
    },
    arrow: {
        position: 'absolute',
        top: '50%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateY: -20 }],
    },
    leftArrow: {
        left: 15,
    },
    rightArrow: {
        right: 15,
    },
});

export default MediaCarousel;