import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { widthPixel } from '../../../utils/fonts'
import Ripple from 'react-native-material-ripple';
import { useSelector } from 'react-redux';
import AppStyles from '../../../styles/AppStyles';

const PaginationButtons = ({ onNext, onPrevious, isFirst, isLast }) => {
    const { colorScheme } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme]



    return (
        <View style={styles.container}>

            <Ripple
                style={styles.button}
                onPress={onPrevious ?? null}
                disabled={isFirst}
            >
                <Image
                    style={styles.image}
                    resizeMethod='contain'
                    tintColor={isFirst ? 'grey' : colorSet?.primaryColor}
                    source={require('../../../../assets/images/home/previous.png')}
                />
            </Ripple>

            <Ripple
                style={styles.button}
                onPress={onNext ?? null}
                disabled={isLast}
            >
                <Image
                    style={styles.image}
                    resizeMethod='contain'
                    tintColor={isLast ? 'grey' : colorSet?.primaryColor}
                    source={require('../../../../assets/images/home/next.png')}
                />
            </Ripple>

        </View>
    )
}

export default PaginationButtons

// Empty stylesheet remains for potential future use
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: widthPixel(4)
    },
    button: {
        height: widthPixel(32),
        width: widthPixel(32),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    image: {
        height: widthPixel(17),
        width: widthPixel(7)
    }
})