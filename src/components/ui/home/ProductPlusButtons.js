import { CirclePlus, Cross, Plus } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Image, Text, TouchableWithoutFeedback } from 'react-native';
import Ripple from 'react-native-material-ripple';
import { heightPixel, widthPixel } from '../../../utils/fonts';
import { PrimaryButton } from '../PrimaryButton';
import { useSelector } from 'react-redux';
import AppStyles from '../../../styles/AppStyles';

// Custom Rotating Cross Component
const CustomRotatingCross = ({ isActive, onPress, productImage }) => {
    const rotateAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    const handlePress = () => {
        const toValue = isActive ? 0 : 1;

        Animated.timing(rotateAnim, {
            toValue: toValue,
            duration: 300,
            useNativeDriver: true,
        }).start();

        onPress();
    };

    useEffect(() => {
        if (!isActive) {
            Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive])


    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '135deg']
    });

    return (
        <Ripple onPress={handlePress} style={styles.container}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Plus size={24} color={'white'} />
            </Animated.View>
        </Ripple>
    );
};

// Main Component
const ProductPlusButtons = ({ products }) => {
    const [activeButton, setActiveButton] = useState(null);
    const { colorScheme } = useSelector(state => state.app);
    const appStyles = AppStyles.getAllStyles(colorScheme);

    const colorSet = AppStyles.colorSet[colorScheme];



    const handleOutsidePress = () => {
        if (activeButton !== null) {
            setActiveButton(null);
        }
    };
    const handleButtonPress = (productId) => {
        if (activeButton === productId) {
            setActiveButton(null); // Close if same button is clicked again
        } else {
            setActiveButton(productId); // Open new button
        }
    };

    return (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>

            <View style={styles.mainContainer}>
                {products.map((product) => (
                    <View
                        key={product.id}
                        style={[
                            styles.buttonContainer,
                            product.position
                        ]}
                    >
                        {/* Product Image with Chat Arrow Connection */}
                        {activeButton === product.id && (
                            <Ripple style={[styles.productContainer, product.arrowPosition]}>
                                {/* Chat Arrow Line */}
                                <View style={styles.arrowLine} />

                                {/* Product Image */}
                                <Image
                                    source={product.image}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />



                                <View style={{
                                    position: 'absolute', alignItems: 'center', justifyContent: 'center',
                                    height: 30, width: '80%', bottom: 10,
                                    backgroundColor: colorSet?.primaryColor, alignSelf: 'center'
                                }}>

                                    <Text style={appStyles.text_10_bold_mainTextColor3}>

                                        {'SHOP NOW'}

                                    </Text>


                                </View>
                            </Ripple>
                        )}
                        {activeButton === product.id &&
                            <View style={styles.arrowHead} />
                        }


                        <CustomRotatingCross
                            isActive={activeButton === product.id}
                            onPress={() => handleButtonPress(product.id)}
                            productImage={product.image}
                        />
                    </View>
                ))}
            </View>
        </TouchableWithoutFeedback>

    );
};

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    buttonContainer: {
        position: 'absolute',
        // Remove flex: 1 - this was causing the issue
    },
    container: {
        height: 32,
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.4)',
        borderColor: 'rgba(255, 0, 0, 0.4)'
    },
    productContainer: {
        position: 'absolute',
        height: heightPixel(150),
        width: widthPixel(100),
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    // arrowLine: {
    //     position: 'absolute',
    //     // backgroundColor: '#007AFF',
    //     height: 20,
    //     zIndex: 200,
    //     width: 100,

    //     // left: -100,
    //     top: '50%',
    // },
    arrowHead: {
        position: 'absolute',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 16,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#fff',
        // left: -108,
        // top: '50%',
        right: 30,
        top: 15,
        // zIndex: 400,
        transform: [{ translateY: -8 }, { rotate: '90deg' }],
    },
});

export default ProductPlusButtons;