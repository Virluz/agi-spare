import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ModelContainer from './ModelContainer'
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import { useTranslation } from 'react-i18next';
import { _getVerticalPadding, DEVICE_WIDTH } from '../../utils/Helper';
import { PrimaryButton } from '../ui/PrimaryButton';
import { widthPixel } from '../../utils/fonts';
import TextModelContainer from './TextModelContainer';
import { SecondaryButton } from '../ui/SecondaryButton';

const AlertModel = ({ onPress, title, description, onCancel }) => {

    const { colorScheme } = useSelector(state => state.app);
    const colorSet = AppStyles.colorSet[colorScheme ?? 'light'];

    const { t } = useTranslation();

    const translateKeys = {
        Okay: t('Okay'),
    }

    const styles = AppStyles.getAllStyles(colorScheme);
    const localStyle = getLocalStyles(colorSet);

    const getChildComponent = () => {
        return (
            <View style={{
                // alignItems: 'center'
            }}>

                {_getVerticalPadding(16)}


                <Text style={[styles.text_24_bold_mainTextColor2, { textAlign: 'center' }]}>

                    {title}

                </Text>

                {_getVerticalPadding(8)}

                <Text style={[styles.text_14_reg_mainTextColor2, { textAlign: 'center' }]}>

                    {description}

                </Text>

                {_getVerticalPadding(24)}

                <View style={localStyle.buttonContainer}>

                    <PrimaryButton
                        title={"Yes"}
                        onPress={onPress}
                        fullWidth={true}
                    />

                    <SecondaryButton
                        title={"No"}
                        onPress={onCancel}
                    />

                </View>

                {_getVerticalPadding(16)}

            </View>
        )
    }

    return (
        <TextModelContainer
            onRequestClose={onPress}
            // imageSource={require('../../../assets/images/travel.png')}
            children={getChildComponent()}
        />
    )
}

export default AlertModel

const getLocalStyles = (colorSet) => {
    return StyleSheet.create({

        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: widthPixel(16),
        },
    })
}