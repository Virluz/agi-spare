import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, TouchableOpacity, Text } from 'react-native';
import { DEVICE_HEIGHT } from '../../../utils/Helper';
import { useSelector } from 'react-redux';
import AppStyles from '../../../styles/AppStyles';

const { width, height } = Dimensions.get('window');

const ImageCarousel = ({ images, interval = 1500, fullHeight = false, showDots = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useState(new Animated.Value(1))[0];
    const { colorScheme, } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme]

    useEffect(() => {
        // Set up the interval for auto-changing images
        const timer = setInterval(() => {
            // Fade out current image
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex === images.length - 1 ? 0 : prevIndex + 1
                );
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, interval);

        // Clean up on unmount
        return () => clearInterval(timer);
    }, [images.length, interval]);

    const goToNext = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const goToPrev = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === 0 ? images.length - 1 : prevIndex - 1
            );
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const goToIndex = (index) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setCurrentIndex(index);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: DEVICE_HEIGHT / 2.2,
            // borderRadius: 12,
            overflow: 'hidden',
            alignSelf: 'center',
            // marginVertical: 20,
            backgroundColor: '#f0f0f0',
        },
        image: {
            width: '100%',
            height: '100%',
        },
        arrow: {
            position: 'absolute',
            top: '50%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -20,
        },
        leftArrow: {
            left: 10,
        },
        rightArrow: {
            right: 10,
        },
        arrowText: {
            color: 'white',
            fontSize: 24,
            fontWeight: 'bold',
        },
        indicatorContainer: {
            position: 'absolute',
            bottom: 20,
            flexDirection: 'row',
            alignSelf: 'center',
        },
        indicator: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.5)',
            marginHorizontal: 5,
        },
        activeIndicator: {
            backgroundColor: colorSet?.primaryColor,
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        counterContainer: {
            position: 'absolute',
            top: 15,
            right: 15,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
        },
        counterText: {
            color: 'white',
            fontSize: 14,
            fontWeight: 'bold',
        },
    });

    return (
        <View style={[styles.container, fullHeight && { height: '100%' }]}>
            <Animated.Image
                source={images[currentIndex]}
                style={[styles.image, { opacity: fadeAnim, }]}
                resizeMode="cover"
            />

            {/* Navigation Arrows */}
            {/* <TouchableOpacity style={[styles.arrow, styles.leftArrow]} onPress={goToPrev}>
                <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.arrow, styles.rightArrow]} onPress={goToNext}>
                <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity> */}

            {/* Indicator Dots */}
            {showDots && <View style={styles.indicatorContainer}>
                {images.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.indicator,
                            index === currentIndex && styles.activeIndicator
                        ]}
                        onPress={() => goToIndex(index)}
                    />
                ))}
            </View>}

            {/* Image Counter */}
            {/* <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                    {currentIndex + 1} / {images.length}
                </Text>
            </View> */}
        </View>
    );
};



export default ImageCarousel;