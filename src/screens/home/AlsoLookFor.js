import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { _getVerticalPadding, ITEM_SPACING, noDataView, SIDE_MARGIN } from '../../utils/Helper';
import SectionName from '../../components/ui/home/SectionName';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native-gesture-handler';
import { showErrorMsg } from '../../widgets/FlashMessages';
import ProductCard from '../../components/ui/ProductCard';
import { getBestSellers } from '../../graphql/graph_request';
import VerticalMediaCarousel from '../../components/ui/home/VerticalMediaCarousel';



const AlsoLookFor = () => {
    const { colorScheme, } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);


    const { t } = useTranslation();

    const translateKeys = {
        alsoLookFor: t('ALSO LOOK FOR'),
    }

    return (
        <ScrollView style={styles.container_no_padding}>

            {_getVerticalPadding(24)}


            <View style={{
                alignItems: 'center',
            }}>

                <SectionName title={translateKeys.alsoLookFor} />

                {_getVerticalPadding(24)}

                <VerticalMediaCarousel />

                {_getVerticalPadding(30)}

            </View>


        </ScrollView >
    )
}

export default AlsoLookFor

const styles = StyleSheet.create({})