import { FlatList, StyleSheet, Text, View } from 'react-native'
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
import { getRecentlyViewedList } from '../../graphql/graph_request';
import { getRecentlyViewedIds } from '../../utils/recentlyViewedUtils';
import eventBus from '../../service/EventBus';



const RecentlyViewed = () => {
    const { colorScheme, } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);

    const [bestSellers, setBestSellers] = useState([]);
    const [newIns, setNewIns] = useState([]);

    const { t } = useTranslation();

    const translateKeys = {
        recentlyViewed: t('RECENTLY VIEWED'),
    }


    useEffect(() => {
        callApi();

        const unsubscribeProductViewed = eventBus.subscribe('ProductViewed', () => {
            // console.log('session_expired:');
            callApi()
        });

        return () => {
            unsubscribeProductViewed()
        }

    }, [])

    const callApi = async (loader) => {
        if (loader)
            setLoading(true)

        try {

            const productIds = await getRecentlyViewedIds();

            // console.log(productIds, " callApiv productIds");


            if (productIds.length > 0) {
                const response = await getRecentlyViewedList({ ids: productIds });
                // console.log("response", response);

                // Initial load
                setBestSellers(response.nodes);
            }




        } catch (error) {

            console.log("error", error);

            showErrorMsg(Constants.DEFAULT_ERROR);

        } finally {
            setLoading(false)
        }
    }

    if (bestSellers.length === 0) return <></>

    return (
        <View style={styles.container_no_padding}>

            {_getVerticalPadding(8)}


            <View style={{
                alignItems: 'center',
            }}>

                <SectionName title={translateKeys.recentlyViewed} />



                <FlatList
                    data={bestSellers}
                    // renderItem={renderItem}

                    renderItem={({ item, index }) => <ProductCard item={{ node: item }} index={index} horizonal />}
                    numColumns={1}
                    keyExtractor={item => item?.id?.toString()}

                    horizontal
                    contentContainerStyle={{
                        paddingHorizontal: SIDE_MARGIN,
                        paddingTop: ITEM_SPACING,
                        paddingBottom: ITEM_SPACING,
                        flexGrow: 1,
                        backgroundColor: colorSet?.mainThemeBackgroundColor,
                    }}
                    showsHorizontalScrollIndicator={false}

                />

            </View>


        </View >
    )
}

export default RecentlyViewed

const styles = StyleSheet.create({})