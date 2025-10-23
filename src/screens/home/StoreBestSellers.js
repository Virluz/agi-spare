import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { _getVerticalPadding, DEVICE_HEIGHT, DEVICE_WIDTH, ITEM_SPACING, noDataView, SIDE_MARGIN } from '../../utils/Helper';
import SectionName from '../../components/ui/home/SectionName';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native-gesture-handler';
import { showErrorMsg } from '../../widgets/FlashMessages';
import ProductCard from '../../components/ui/ProductCard';
import { getBestSellers, getCollectionByHandle } from '../../graphql/graph_request';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import PaginationButtons from '../../components/ui/home/PaginationButtons';
import FastImage from '@d11/react-native-fast-image';
import { useNavigation } from '@react-navigation/native';


const ITEMS_PER_PAGE = 2;

const ShopBestSellers = () => {
    const { colorScheme, } = useSelector(state => state.app);

    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);



    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const [bestSellers, setBestSellers] = useState([]);
    const [newIns, setNewIns] = useState([]);

    const { t } = useTranslation();

    const translateKeys = {
        viewAll: t('VIEW ALL'),
        storeBestSeller: t("STORE BEST SELLER")

    }


    useEffect(() => {
        callApi();


    }, [])

    const callApi = async (loader) => {
        if (loader)
            setLoading(true)

        try {


            const response = await getCollectionByHandle({ first: 6, handle: 'best-sellers' });
            // console.log("response", response);

            // Initial load
            setBestSellers(response?.collection.products.edges);



        } catch (error) {

            console.log("error", error);

            showErrorMsg(Constants.DEFAULT_ERROR);

        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        const newIndex = currentIndex + ITEMS_PER_PAGE;
        if (newIndex < bestSellers.length) {
            flatListRef.current?.scrollToIndex({
                index: newIndex,
                animated: true,
            });
            setCurrentIndex(newIndex);
        }
    };

    const handlePrevious = () => {
        const newIndex = Math.max(0, currentIndex - ITEMS_PER_PAGE);
        flatListRef.current?.scrollToIndex({
            index: newIndex,
            animated: true,
        });
        setCurrentIndex(newIndex);
    };

    const handleScrollEnd = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / (DEVICE_WIDTH / 2));

        const clampedIndex = Math.max(0, Math.min(newIndex, bestSellers.length - ITEMS_PER_PAGE));
        setCurrentIndex(clampedIndex);
    };

    return (
        <View style={[styles.container_no_padding,]}>


            <View style={{
                alignItems: 'center', flex: 1, backgroundColor: '#000'
            }}>

                {_getVerticalPadding(16)}

                <View style={{ flex: 1, width: DEVICE_WIDTH - widthPixel(32), height: DEVICE_HEIGHT / 3 }}>
                    <FastImage
                        style={{ height: '100%', width: '100%', }}
                        source={require('../../../assets/images/home/store_photo.png')}
                    >

                        <View style={{ position: 'absolute', zIndex: 10, width: '100%', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                            <SectionName title={translateKeys.storeBestSeller} width={widthPixel(100)} />

                        </View>

                    </FastImage>
                </View>



                <FlatList
                    data={bestSellers}
                    ref={flatListRef}
                    // renderItem={renderItem}
                    horizontal
                    renderItem={({ item, index }) => <ProductCard item={item} index={index} isDarkBackground showColors={false} horizonal />}

                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: SIDE_MARGIN,
                        paddingTop: ITEM_SPACING,
                        paddingBottom: ITEM_SPACING,
                        flexGrow: 1,
                        backgroundColor: '#000'
                    }}
                    onScrollEndDrag={handleScrollEnd}
                    decelerationRate="fast"

                />

                <View style={{
                    width: DEVICE_WIDTH - widthPixel(32),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>

                    <PrimaryButton title={translateKeys.viewAll} showNextArrows onPress={() => navigation.navigate('ProductList', { handle: 'best-sellers', title: 'Store Best Sellers' })} />

                    <PaginationButtons
                        isFirst={currentIndex === 0}
                        isLast={currentIndex >= bestSellers.length - ITEMS_PER_PAGE}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />

                </View>

            </View>


        </View >
    )
}

export default ShopBestSellers

const styles = StyleSheet.create({})