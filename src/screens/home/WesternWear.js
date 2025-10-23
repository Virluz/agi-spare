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
import { getCollectionByHandle } from '../../graphql/graph_request';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import ImageCarousel from '../../components/ui/home/ImageCarousel';
import { useNavigation } from '@react-navigation/native';



const WesternWear = () => {
    const { colorScheme, } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [westernWears, setWesternWears] = useState([]);
    const [newIns, setNewIns] = useState([]);

    const { t } = useTranslation();

    const handle = 'women-western-wear'
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


            const response = await getCollectionByHandle({ first: 2, handle });
            // console.log("response", response);

            // Initial load
            setWesternWears(response.collection.products.edges);


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

                <View style={{ marginHorizontal: widthPixel(16), flex: 1, width: DEVICE_WIDTH - widthPixel(32) }}>


                    <ImageCarousel

                        images={[
                            require('../../../assets/images/home/western_1.jpg'),
                            require('../../../assets/images/home/western_2.jpg'),
                            require('../../../assets/images/home/western_3.jpg'),
                        ]}
                    />

                    <View style={{
                        position: 'absolute', width: widthPixel(150),
                        left: 20, bottom: 40,
                    }}>

                        <Text style={styles.text_20_reg_white_secondaryFont}>

                            {'Women Western Wear'}

                        </Text>

                        <Text style={styles.text_14_reg_white}>

                            {'start @399'}

                        </Text>

                        {_getVerticalPadding(16)}

                        <PrimaryButton title={'Explore'} showNextArrows onPress={() => navigation.navigate('ProductList', { handle, title: 'Western Wear' })} />


                    </View>

                </View>



                <FlatList
                    data={westernWears}
                    // renderItem={renderItem}
                    renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
                    numColumns={2}
                    keyExtractor={item => item?.cursor?.toString()}

                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: SIDE_MARGIN,
                        paddingTop: ITEM_SPACING,
                        paddingBottom: ITEM_SPACING,
                        flexGrow: 1,
                        backgroundColor: colorSet?.mainThemeBackgroundColor,
                    }}
                    ListFooterComponent={<PrimaryButton title={translateKeys.viewAll} showNextArrows onPress={() => navigation.navigate('ProductList', { handle, title: 'Wesetrn Wear' })} />}
                    scrollEnabled={false}

                />

            </View>


        </View >
    )
}

export default WesternWear

const styles = StyleSheet.create({})