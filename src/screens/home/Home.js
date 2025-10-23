import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Image, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCollections } from '../../redux/reducers/collectionSlice';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import MediaCarousel from '../../components/ui/home/MediaCarousel';
import { _getVerticalPadding, DEVICE_HEIGHT } from '../../utils/Helper';
import MostLoved from './MostLoved';
import WesternWear from './WesternWear';
import ShopBestSellers from './StoreBestSellers';
import AlsoLookFor from './AlsoLookFor';
import ShopTheLook from './ShopTheLook';
import ShopByStyle from './ShopByStyle';
import RecentlyViewed from './RecentlyViewed';
import Fluidx from './Fluidx';
import Care from './Care';
import { heightPixel } from '../../utils/fonts';
import storeFrontClient from '../../graphql/storeFrontClient';
import { MENU_QUERY } from '../../graphql/queries/menu/fetch_menus';
import LoginFlow from './LoginFlow';
import OnboardCarousel from '../profile/OnboardCarousel';
import Wishlist from '../profile/Wishlist';
import Login from '../auth/Login';
import SignUp from '../auth/SignUp';
import CollectionsGrid from '../../components/ui/home/CollectionsGrid';


const data = [
    { id: '1', image: 'https://picsum.photos/id/237/200/300' },
    { id: '2', image: 'https://picsum.photos/id/238/200/300' },
    { id: '3', image: 'https://picsum.photos/id/239/200/300' },
    { id: '4', image: 'https://picsum.photos/id/240/200/300' },
];

const height = Dimensions.get('window').height - heightPixel(140)


const Home = () => {
    const dispatch = useDispatch();
    const { colorScheme, } = useSelector(state => state.app);

    const collections = useSelector(state => state?.collections?.collections);
    const styles = AppStyles.getAllStyles(colorScheme);

    console.log("collections", collections);
    console.log("collections length", collections?.length);
    console.log("first collection", collections?.[0]);

    const scrollRef = useRef(null);

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const result = dispatch(fetchCollections(200));


                const response = await storeFrontClient.request(MENU_QUERY, { handle: 'react-native-mobile-app' });
                console.log('MENU_QUERY result:', response, result); // Debug the response
            } catch (err) {
                console.error('Collection fetch error:', err);
            }
        };
        loadCollections();
    }, [dispatch]);



    const [activeVideoIndex, setActiveVideoIndex] = useState(0);

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        // Calculate which video should be playing based on scroll position
        const index = Math.round(offsetY / height);

        // console.log("index", index, offsetY, height, offsetY / height);

        if (index >= 0 && index < 5 && index !== activeVideoIndex) { // 5 is your video count
            setActiveVideoIndex(index);
        }
    };

    return (
        <>
            <Toolbar home={true} title={'Style Union'} isSearch />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: heightPixel(100) }}
            >

                {/* Collections Grid */}
                <CollectionsGrid
                    collections={collections}
                    title="Categories"
                />

                {/* Other home sections can be added here */}
                {/* <MostLoved />
                <WesternWear />
                <ShopBestSellers />
                <AlsoLookFor />
                <ShopTheLook />
                <ShopByStyle />
                <RecentlyViewed />
                <Fluidx />
                <Care /> */}

            </ScrollView>
        </>
    );
};

export default Home;