import React from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AppStyles from '../styles/AppStyles';
import { DEVICE_HEIGHT, DEVICE_WIDTH } from '../utils/Helper';

const Loader = (props) => {
    TouchableOpacity.defaultProps = { ...(TouchableOpacity.defaultProps || {}), delayPressIn: 0 };
    const inset = useSafeAreaInsets();
    const { colorScheme } = useSelector(state => state.app);

    const appStyles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];

    return (
        <View style={styles.overlay}>
            <ActivityIndicator
                animating={true}
                color={colorSet.black}
                size={props?.small ? 'small' : 'large'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: DEVICE_WIDTH,
        height: DEVICE_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black overlay
        zIndex: 9999, // Ensure it's above other views
    },
});

export default Loader;
