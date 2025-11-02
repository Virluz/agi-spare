import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { _getVerticalPadding, DEVICE_HEIGHT, DEVICE_WIDTH, ITEM_SPACING, noDataView, SIDE_MARGIN } from '../../utils/Helper';
import SectionName from '../../components/ui/home/SectionName';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native-gesture-handler';
import { showErrorMsg } from '../../widgets/FlashMessages';
import ProductCard from '../../components/ui/ProductCard';
import { getBestSellers } from '../../graphql/graph_request';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import FastImage from '@d11/react-native-fast-image';



const Fluidx = () => {
    const { colorScheme, } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);

    const [bestSellers, setBestSellers] = useState([]);
    const [newIns, setNewIns] = useState([]);

    const { t } = useTranslation();

    const translateKeys = {
        viewAll: t('VIEW ALL'),
        bestSeller: t('BEST SELLERS'),
        newIn: t('NEW IN')
    }


    useEffect(() => {
        callApi();


    }, [])

    const callApi = async (loader) => {
        if (loader)
            setLoading(true)

        try {


            const response = await getBestSellers({ first: 2 });
            // console.log("response", response);

            // Initial load
            setBestSellers(response.products.edges);



        } catch (error) {

            console.log("error", error);

            showErrorMsg(Constants.DEFAULT_ERROR);

        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container_no_padding}>


            <View style={{
                alignItems: 'center',
            }}>

                <SectionName title={'Everyone is talking about agi spare'.toUpperCase()} width={DEVICE_WIDTH - 100} />

                {_getVerticalPadding(30)}

                <View style={{ marginHorizontal: widthPixel(16), flex: 1, width: DEVICE_WIDTH - widthPixel(32) }}>
                    <FastImage
                        style={{ height: DEVICE_HEIGHT / 1.5, width: '100%', }}
                        source={require('../../../assets/images/home/fluidx.png')}
                        resizeMode='contain'
                    />

                </View>

            </View>


        </View >
    )
}

export default Fluidx

const styles = StyleSheet.create({})