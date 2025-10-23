import { CirclePlus, Cross, CrossIcon, Plus } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Ripple from 'react-native-material-ripple';
import { widthPixel } from '../../../utils/fonts';


const CustomRotatingCross = ({ }) => {
    const [isOpen, setIsOpen] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const handlePress = () => {
        const toValue = isOpen ? 0 : 1;

        Animated.timing(rotateAnim, {
            toValue: toValue,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsOpen(!isOpen);
        });
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '225deg']
    });

    return (
        <Ripple onPress={handlePress} style={styles.container}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Plus size={24} color={'white'} />
            </Animated.View>
        </Ripple>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 32, width: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.4)',
        borderColor: 'rgba(255, 0, 0, 0.4)'
    },
});

export default CustomRotatingCross;
