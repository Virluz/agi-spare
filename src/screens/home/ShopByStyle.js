import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
import { getBestSellers, getCollectionByStyle } from '../../graphql/graph_request';
import Ripple from 'react-native-material-ripple';
import FastImage from '@d11/react-native-fast-image';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';



const ShopByStyle = () => {
    const { colorScheme, } = useSelector(state => state.app);
    const [activeStyle, setActiveStyle] = useState('TSHIRT');
    const [gender, setGender] = useState('men');
    const navigation = useNavigation();

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);

    const [bestSellers, setBestSellers] = useState([]);
    const [newIns, setNewIns] = useState([]);

    const { t } = useTranslation();

    const translateKeys = {
        shopByStyle: t('SHOP BY STYLE'),
        viewAll: t('VIEW ALL'),
    }


    useEffect(() => {
        callApi();

    }, [activeStyle, gender])

    const callApi = async (loader) => {
        if (loader)
            setLoading(true)

        try {


            const response = await getCollectionByStyle({
                query: `tag:${activeStyle} AND tag:${gender}`,
                first: 4,
                after: null
            });
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

            {_getVerticalPadding(20)}


            <View style={{
                alignItems: 'center',
            }}>



                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: widthPixel(10),
                }}>

                    <Ripple onPress={() => setGender('men')}
                        style={{
                        }}
                    >

                        <FastImage
                            source={require('../../../assets/images/home/men.png')}
                            style={{ height: 72, width: 72 }}
                            tintColor={gender === 'men' ? colorSet?.primaryColor : colorSet?.black}
                            resizeMode='contain'
                        />

                        {/* <Text style={styles}>


                            {'MEN'}

                        </Text> */}

                    </Ripple>

                    <SectionName title={translateKeys.shopByStyle} />

                    <Ripple onPress={() => setGender('women')} style={{
                    }}>

                        <FastImage
                            source={require('../../../assets/images/home/women_new.png')}
                            style={{ height: 72, width: 72, }}
                            resizeMode='contain'
                            tintColor={gender === 'women' ? colorSet?.primaryColor : colorSet?.black}

                        />

                    </Ripple>


                </View>

            </View>

            <FlatList
                data={[
                    { title: "TSHIRT" },
                    { title: 'SHIRT' },
                    { title: 'JEANS' },
                    { title: 'KURTAS' },
                    { title: 'JACKETS' },
                    { title: 'ACCESSORIES' },

                ]}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ padding: widthPixel(16) }}
                keyExtractor={(item) => item.title}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={[
                            { paddingRight: widthPixel(10) },

                        ]}
                        onPress={() => setActiveStyle(item?.title)}
                    >
                        <Text style={[
                            styles.text_12_reg_mainTextColor2, { opacity: 0.4 },
                            activeStyle === item.title && { opacity: 1 }
                        ]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                )}
                getItemLayout={(data, index) => (
                    { length: 100, offset: 100 * index, index } // Adjust based on your item width
                )}
                initialScrollIndex={0}
            />

            <FlatList
                data={bestSellers}
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
                ListFooterComponent={<PrimaryButton title={translateKeys.viewAll} showNextArrows onPress={() => navigation.navigate('ProductList', { handle: "" })} />}
                scrollEnabled={false}
            />



        </View >
    )
}

export default ShopByStyle

const styles = StyleSheet.create({})