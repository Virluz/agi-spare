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
import CasualOutfitBox from '../../components/ui/home/CasualOutfitBox';

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

const ShopBy = () => {
    const { colorScheme, } = useSelector(state => state.app);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const flatListRef = useRef(null);

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [loading, setLoading] = useState(false);

    const [bestSellers, setBestSellers] = useState([]);
    const [newIns, setNewIns] = useState([]);

    const { t } = useTranslation();

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
                    keyExtractor={item => item?.cursor?.toString()}
                    onScrollEndDrag={handleScrollEnd}
                    renderItem={({ item, index }) => (
                        <>
                            <View style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT / 1.5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'light' }}>



                                <FastImage
                                    style={{ height: '80%', width: '70%', }}
                                    resizeMode='contain'
                                    source={require('../../../assets/images/category/3d.png')}
                                />

                                {/* <CasualOutfitBox /> */}
                            </View>


                        </>
                    )}
                />

            </View>

        </View >
    )
}

export default ShopBy

const styles = StyleSheet.create({})