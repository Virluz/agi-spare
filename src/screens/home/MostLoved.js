import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { _getVerticalPadding, extactColorsFromVariants, ITEM_SPACING, noDataView, SIDE_MARGIN } from '../../utils/Helper';
import SectionName from '../../components/ui/home/SectionName';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native-gesture-handler';
import { showErrorMsg } from '../../widgets/FlashMessages';
import ProductCard from '../../components/ui/ProductCard';
import { getBestSellers, getCollectionByHandle } from '../../graphql/graph_request';
import Ripple from "react-native-material-ripple";



const MostLoved = () => {
    const { colorScheme, } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);


    const [bestSellers, setBestSellers] = useState([]);
    const [newIns, setNewIns] = useState([]);

    const { t } = useTranslation();

    const translateKeys = {
        mostLoved: t('MOST LOVED STYLE'),
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


            const response = await getBestSellers({ first: 4 });
            // console.log("response", response);

            // Initial load
            setBestSellers(response.products.edges);





            const responseNewIns = await getCollectionByHandle({
                handle: "new-new", // required
                first: 4 // optional, defaults to 20
            });
            // console.log("response", responseNewIns,);

            // Initial load
            setNewIns(responseNewIns.collection.products.edges);



        } catch (error) {

            console.log("error", error);

            showErrorMsg(Constants.DEFAULT_ERROR);

        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container_no_padding}>

            {_getVerticalPadding(30)}


            <View style={{
                alignItems: 'center',
            }}>

                <SectionName title={translateKeys.mostLoved} />

                {_getVerticalPadding(10)}

                <View style={{ flexDirection: 'row', }}>

                    <Ripple style={{ padding: widthPixel(10), opacity: selectedTab === 1 ? 0.3 : 1 }} onPress={() => setSelectedTab(0)}>

                        <Text style={styles.text_16_semi_mainTextColor2}>
                            {translateKeys.bestSeller}
                        </Text>
                    </Ripple >

                    <Ripple style={{ padding: widthPixel(10), opacity: selectedTab === 0 ? 0.3 : 1, }} onPress={() => setSelectedTab(1)}>

                        <Text style={styles.text_16_semi_mainTextColor2}>
                            {translateKeys.newIn}
                        </Text>

                    </Ripple>

                </View>

                <FlatList
                    data={selectedTab === 0 ? bestSellers : newIns}
                    // renderItem={renderItem}

                    renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
                    numColumns={2}
                    keyExtractor={item => item?.node?.id?.toString()}

                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: SIDE_MARGIN,
                        paddingTop: ITEM_SPACING,
                        paddingBottom: ITEM_SPACING,
                        flexGrow: 1,
                        backgroundColor: colorSet?.mainThemeBackgroundColor,
                    }}
                    scrollEnabled={false}
                />

            </View>


        </View >
    )
}

export default MostLoved

const styles = StyleSheet.create({})