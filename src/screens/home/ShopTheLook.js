
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
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
import { getBestSellers, getRecentlyViewedList } from '../../graphql/graph_request';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import CustomRotatingCross from '../../components/ui/home/CustomRotatingCross';
import ProductPlusButtons from '../../components/ui/home/ProductPlusButtons';
import PaginationButtons from '../../components/ui/home/PaginationButtons';
import FastImage from '@d11/react-native-fast-image';

const looks = [
    {
        image: require('../../../assets/images/home/shop_this_look.png'),
        data: [
            {
                id: 1,
                position: { top: 200, right: 190 }, // Changed from undefined to 0
                image: { uri: 'https://cdn.shopify.com/s/files/1/0623/4754/2777/files/MC0006BOTTLEGREEN_1_300x300_crop_center.jpg?v=1740676067' },
                arrowPosition: { left: -120, top: -20 }
            },
            {
                id: 2,
                position: { top: 400, right: 80 },
                image: { uri: 'https://cdn.shopify.com/s/files/1/0623/4754/2777/files/MC0006BOTTLEGREEN_1_300x300_crop_center.jpg?v=1740676067' },

                arrowPosition: { left: -120, top: -20 }
            },
            {
                id: 3,
                position: { top: 250, right: 80 },
                image: { uri: 'https://cdn.shopify.com/s/files/1/0623/4754/2777/files/MC0006BOTTLEGREEN_1_300x300_crop_center.jpg?v=1740676067' },

                arrowPosition: { left: -120, top: -20 }
            }
        ],
        id: 1,
    },
    {
        image: require('../../../assets/images/home/shop_this_look_two.png'),
        data: [
            {
                id: 1,
                position: { top: 30, right: 150 }, // Changed from undefined to 0
                image: { uri: 'https://cdn.shopify.com/s/files/1/0623/4754/2777/files/MC0006BOTTLEGREEN_1_300x300_crop_center.jpg?v=1740676067' },

                arrowPosition: { left: -120, top: -20 }
            },
            {
                id: 2,
                position: { top: 400, right: 110 },
                image: { uri: 'https://cdn.shopify.com/s/files/1/0623/4754/2777/files/MC0006BOTTLEGREEN_1_300x300_crop_center.jpg?v=1740676067' },

                arrowPosition: { left: -120, top: -20 }
            },
            {
                id: 3,
                position: { top: 250, right: 110 },
                image: { uri: 'https://cdn.shopify.com/s/files/1/0623/4754/2777/files/MC0006BOTTLEGREEN_1_300x300_crop_center.jpg?v=1740676067' },
                arrowPosition: { left: -120, top: -20 }
            }
        ],
        id: 2,
    }
]

const ShopTheLook = () => {
    const { colorScheme, } = useSelector(state => state.app);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const flatListRef = useRef(null);

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);

    const [bestSellers, setBestSellers] = useState([]);
    const [newIns, setNewIns] = useState([]);

    const { t } = useTranslation();

    const translateKeys = {
        shopThisLook: t('SHOP THIS LOOK'),

    }


    useEffect(() => {
        callApi();


    }, [])

    const callApi = async (loader) => {
        if (loader)
            setLoading(true)

        try {


            const response = await getRecentlyViewedList({ first: 2, ids: ['gid://shopify/Product/8223709036793'] });
            console.log("response", response);



        } catch (error) {

            console.log("error", error);

            showErrorMsg(Constants.DEFAULT_ERROR);

        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        const newIndex = currentIndex + 1;
        if (newIndex < looks.length) {
            flatListRef.current?.scrollToIndex({
                index: newIndex,
                animated: true,
            });
            setCurrentIndex(newIndex);
        }
    };

    const handlePrevious = () => {
        const newIndex = Math.max(0, currentIndex - 1);
        flatListRef.current?.scrollToIndex({
            index: newIndex,
            animated: true,
        });
        setCurrentIndex(newIndex);
    };


    const handleScrollEnd = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / DEVICE_WIDTH);

        const clampedIndex = Math.max(0, Math.min(newIndex, looks.length));
        setCurrentIndex(clampedIndex);
    };


    return (
        <View style={[styles.container_no_padding,]}>


            <View
                style={{
                    alignItems: 'center', flex: 1,
                }}


            >

                {_getVerticalPadding(16)}

                <FlatList
                    data={looks}
                    horizontal
                    pagingEnabled
                    ref={flatListRef}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => String(item?.id ?? index)}
                    onScrollEndDrag={handleScrollEnd}
                    renderItem={({ item, index }) => (
                        <>


                            <View style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT / 1.5, }}>

                                <FastImage
                                    style={{ height: '100%', width: '100%', }}
                                    source={item.image}
                                />




                            </View>

                            <ProductPlusButtons products={item.data} />



                        </>
                    )}
                />

                <View style={{ position: 'absolute', zIndex: 10, bottom: 40, width: '100%', left: 40 }}>

                    <SectionName title={translateKeys.shopThisLook} width={widthPixel(100)} />

                </View>

                <View style={{
                    position: 'absolute',
                    right: 10, bottom: 10
                }}>

                    <PaginationButtons

                        isFirst={currentIndex === 0}
                        isLast={currentIndex >= looks.length - 1}
                        onNext={handleNext}
                        onPrevious={handlePrevious}

                    />

                </View>
                {/* {['images', 'dsd'].map((image, index) => (
                   


                ))} */}




                {/* <View style={{
                    position: 'absolute',
                    zIndex: 100,
                    top: 200,
                }}>

                    {true &&
                        <View style={{
                            position: 'absolute', left: -120, top: -20,
                            height: 100, width: 100, backgroundColor: 'red'
                        }}>


                        </View>
                    }

                    <CustomRotatingCross />


                </View>

                <View style={{
                    position: 'absolute',
                    zIndex: 100,
                    top: 400,
                    right: 60,
                }}>


                    {true &&
                        <View style={{
                            position: 'absolute', left: -120, top: -20,
                            height: 100, width: 100, backgroundColor: 'red'
                        }}>


                        </View>
                    }

                    <CustomRotatingCross />

                </View>

                <View style={{
                    position: 'absolute',
                    zIndex: 100,
                    top: 250,
                    right: 80,
                }}>


                    {true &&
                        <View style={{
                            position: 'absolute', left: -120, top: -20,
                            height: 100, width: 100, backgroundColor: 'red'
                        }}>


                        </View>
                    }
                    <CustomRotatingCross />

                </View> */}


            </View>


        </View >
    )
}

export default ShopTheLook

const styles = StyleSheet.create({})