import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    interpolate,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Archive } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_SWIPE = -SCREEN_WIDTH;
const TRIGGER_SWIPE = -SCREEN_WIDTH * 0.6;

export default function SwipeToArchiveItem({ children, onArchive }) {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const showBackground = useSharedValue(1);
    const [visible, setVisible] = useState(true);

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startX = translateX.value;
        },
        onActive: (event, ctx) => {
            const newTranslate = ctx.startX + event.translationX;
            translateX.value = Math.min(Math.max(newTranslate, MAX_SWIPE), 0);
        },
        onEnd: () => {
            if (translateX.value < TRIGGER_SWIPE) {
                // Slide out → fade → collapse → remove
                translateX.value = withTiming(MAX_SWIPE, {}, (finished) => {
                    if (finished) {
                        opacity.value = withTiming(0, { duration: 150 });
                        scaleY.value = withTiming(0, { duration: 200 }, (done) => {
                            if (done) {
                                showBackground.value = 0;
                                runOnJS(setVisible)(false);
                                runOnJS(onArchive)();
                            }
                        });
                    }
                });
            } else {
                translateX.value = withTiming(0);
            }
        },
    });

    const contentStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scaleY: scaleY.value },
        ],
        opacity: opacity.value,
    }));

    const iconStyle = useAnimatedStyle(() => {
        const iconOpacity = interpolate(
            translateX.value,
            [0, MAX_SWIPE],
            [0, 1],
            'clamp'
        );
        const scale = interpolate(
            translateX.value,
            [0, MAX_SWIPE],
            [0.7, 1],
            'clamp'
        );
        return {
            opacity: iconOpacity * showBackground.value,
            transform: [{ scale }],
        };
    });

    if (!visible) return null;

    return (
        <View style={styles.container}>
            {/* Archive background */}
            <Animated.View style={[styles.background]}>
                <Animated.View style={[styles.archiveIconContainer, iconStyle]}>
                    <Archive size={24} color="black" />
                </Animated.View>
            </Animated.View>

            {/* Foreground content */}
            <PanGestureHandler
                onGestureEvent={gestureHandler}
                activeOffsetX={[-10, 10]}
                failOffsetY={[-10, 10]}
            >
                <Animated.View style={[styles.content, contentStyle]}>
                    {children}
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 8,
        marginVertical: 4,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#E0E0E0',

        justifyContent: 'center',
        alignItems: 'flex-end',
        borderRadius: 8,
        paddingRight: 20,
    },
    archiveIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 8,
    },
});
