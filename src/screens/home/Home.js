import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchCollections } from '../../redux/reducers/collectionSlice';
import AppStyles, { fontFamily } from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import { _getVerticalPadding, DEVICE_WIDTH } from '../../utils/Helper';
import { heightPixel, widthPixel } from '../../utils/fonts';
import storeFrontClient from '../../graphql/storeFrontClient';
import { MENU_QUERY } from '../../graphql/queries/menu/fetch_menus';
import FastImage from '@d11/react-native-fast-image';
import { SearchIcon, ArrowRight, Instagram, Youtube, Facebook } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import ProductCard from '../../components/ui/ProductCard';
import BestSeller from '../category/BestSeller';
import Carousel from 'react-native-reanimated-carousel';

const height = Dimensions.get('window').height - heightPixel(140);

// Success stories data
const successStories = [
    {
        quote: "Our company placed an order for JLG Load pin, product was available and we got an immediate delivery with superior quality, as compared to other suppliers they have good speed & flexibility, Also the website and app is very user friendly.",
        author: "Manufacturing Company"
    },
    {
        quote: "Excellent service and fast delivery! We needed urgent spare parts for our construction equipment, and AGI Spare delivered within 24 hours. The quality is outstanding and their customer support is exceptional.",
        author: "Construction Ltd."
    },
    {
        quote: "We've been partnering with AGI Spare for over two years now. Their extensive inventory and competitive pricing have helped us reduce downtime significantly. Highly recommended!",
        author: "Industrial Services Inc."
    },
    {
        quote: "The platform is incredibly easy to use, and the product quality is consistently excellent. AGI Spare has become our go-to supplier for all heavy equipment spare parts.",
        author: "Heavy Equipment Corp."
    }
];

// Simple local image carousel for the hero banner
const BannerCarousel = () => {
    const [index, setIndex] = useState(0);
    const images = [
        'https://agi-spare.myshopify.com/cdn/shop/files/Tire_Banner_Website_View.jpg?v=1764931402',
        "https://agi-spare.myshopify.com/cdn/shop/files/Engine_Parts_Website_View.jpg?v=1764931289",
        "https://agi-spare.myshopify.com/cdn/shop/files/All_Parts_Website_View.jpg?v=1764931236",
        "https://agi-spare.myshopify.com/cdn/shop/files/Hydraulic_Parts_Website_View.jpg?v=1764931456"
    ];

    return (
        <View style={{ marginTop: heightPixel(8) }}>
            <Carousel
                loop
                width={DEVICE_WIDTH}
                height={heightPixel(160)}
                autoPlay={true}
                autoPlayInterval={3000}
                scrollAnimationDuration={800}
                data={images}
                onSnapToItem={(idx) => setIndex(idx)}
                renderItem={({ item }) => (
                    <FastImage
                        source={{ uri: item }}
                        style={{
                            width: DEVICE_WIDTH - widthPixel(32),
                            height: heightPixel(160),
                            marginHorizontal: widthPixel(16),
                            borderRadius: widthPixel(12)
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                )}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: heightPixel(8) }}>
                {images.map((_, i) => (
                    <View
                        key={i}
                        style={{
                            width: i === index ? 16 : 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: i === index ? '#4A4A68' : 'rgba(74,74,104,0.4)',
                            marginHorizontal: 4,
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

const Home = () => {
    const dispatch = useDispatch();
    const { colorScheme, } = useSelector(state => state.app);
    const navigation = useNavigation();

    const collections = useSelector(state => state?.collections?.collections);
    const styles = AppStyles.getAllStyles(colorScheme);

    const scrollRef = useRef(null);

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const result = dispatch(fetchCollections(200));
                const response = await storeFrontClient.request(MENU_QUERY, { handle: 'react-native-mobile-app' });
                console.log('MENU_QUERY result:', response, result);
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

            <Toolbar home={true} title={'agi spare'} isSearch />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: heightPixel(100) }}
            >


                {_getVerticalPadding(12)}

                {/* Search bar */}
                {/* <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('SearchPage')}
                    style={localStyles.searchContainer}
                >
                    <SearchIcon size={20} color={'#605E5E'} />
                    <Text style={localStyles.searchPlaceholder}>Find perfect spare part…</Text>
                </TouchableOpacity> */}

                {/* Hero banner */}
                <BannerCarousel />

                {/* Welcome card */}
                <View style={localStyles.welcomeCard}>
                    <Text style={localStyles.welcomeTitle}>Welcome to AGI Spare</Text>
                    <Text style={localStyles.welcomeSubtitle}>Reaching New Heights in Safety{"\n"}and Service</Text>
                    <Text style={localStyles.welcomeBody}>
                        Since 2014, Al-Gyas Infrastructure has specialised in supplying high-quality original and OEM spare parts for Aerial Work Platforms across India. Headquartere in Mumbai, we source parts from trusted.
                    </Text>
                </View>

                {/* Shop by Category section */}
                <View style={localStyles.categorySection}>
                    <Text style={localStyles.sectionTitle}>Shop by Category</Text>

                    <View style={localStyles.categoryGrid}>
                        {(collections || []).slice(0, 6).map((item, idx) => (
                            <TouchableOpacity
                                key={item?.id || idx}
                                style={localStyles.categoryCard}
                                onPress={() => navigation.navigate('ProductList', { handle: item?.handle, title: item?.title })}
                            >
                                <FastImage
                                    source={item?.image?.url ? { uri: item.image.url } : require('../../../assets/images/img.png')}
                                    style={localStyles.categoryImage}
                                    resizeMode={FastImage.resizeMode.contain}
                                />

                                <View style={localStyles.categoryFooter}>
                                    <Text numberOfLines={1} style={localStyles.categoryText}>{item?.title || 'Category'}</Text>
                                    <ArrowRight size={18} color={'#F2994A'} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={localStyles.loadMore} onPress={() => navigation.navigate('Category')}>
                        <Text style={localStyles.loadMoreText}>Load More</Text>
                    </TouchableOpacity>
                </View>

                {/* Best Sellers */}
                <BestSeller />
                {/* <View style={localStyles.bestSellersSection}>
                    <Text style={localStyles.bestSellersTitle}>Best Sellers</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: widthPixel(12) }}
                    >
                        {bestSellers.map((p, i) => (
                            <ProductCard key={i} item={p} index={i} />

                            // <ProductCard
                            //     item={item}
                            //     index={index}
                            //     showColors={false}
                            //     disableNavigation={true}
                            //     showAddToCartButton={true}
                            //     showDetails={true}
                            // />
                            // <View key={i} style={localStyles.bestCard}>
                            //     <FastImage
                            //         source={p.image || require('../../../assets/images/img.png')}
                            //         style={localStyles.bestImage}
                            //         resizeMode={FastImage.resizeMode.contain}
                            //     />
                            //     <View style={{ paddingHorizontal: widthPixel(12), paddingBottom: heightPixel(12) }}>
                            //         <Text numberOfLines={2} style={localStyles.bestName}>{p.name}</Text>
                            //         <Text style={localStyles.bestSku}>{p.sku}</Text>
                            //         <Text numberOfLines={1} style={localStyles.bestMeta}>{p.meta}</Text>
                            //         <View style={{ height: heightPixel(10) }} />
                            //         <PrimaryButton title={'Know More'} color={'#F2994A'} onPress={() => navigation.navigate('ProductList')} />
                            //     </View>
                            // </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={[localStyles.loadMore, { marginBottom: heightPixel(8) }]} onPress={() => navigation.navigate('ProductList')}>
                        <Text style={localStyles.loadMoreText}>View All</Text>
                    </TouchableOpacity>
                </View> */}

                {/* Partners */}
                <View style={localStyles.partnersSection}>
                    <Text style={localStyles.partnersTitle}>Our brands and partners</Text>
                    <Text style={localStyles.partnersSubtitle}>Trusted by leading brands and{"\n"}valued clients worldwide</Text>

                    <View style={localStyles.partnersGrid}>
                        {partnerLogos.map((logo, i) => (
                            <View key={i} style={localStyles.partnerBox}>
                                <FastImage
                                    source={logo}

                                    resizeMode={FastImage.resizeMode.contain}
                                    style={{ width: '60%', height: '50%' }}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Success Story Carousel */}
                <View style={localStyles.successSection}>
                    <Text style={localStyles.successTitle}>Our Success Story</Text>
                    <Text style={localStyles.successSubtitle}>Brand that set the standard</Text>

                    <Carousel
                        loop
                        width={DEVICE_WIDTH}
                        // height={heightPixel(140)}
                        autoPlay={true}
                        autoPlayInterval={3000}
                        scrollAnimationDuration={1000}
                        data={successStories}
                        renderItem={({ item }) => (
                            <View style={localStyles.quoteCard}>
                                <Text style={localStyles.quoteMark}>"</Text>
                                <Text style={localStyles.quoteText}>
                                    {item.quote}
                                </Text>
                                {item.author && (
                                    <Text style={localStyles.quoteAuthor}>— {item.author}</Text>
                                )}
                            </View>
                        )}
                    />
                </View>

                {/* Socials */}
                <View style={localStyles.socialSection}>
                    <Text style={localStyles.socialTitle}>Follow Us On Social Media</Text>
                    <View style={localStyles.socialRow}>
                        <TouchableOpacity style={localStyles.socialIcon}>
                            <Instagram color={'#000'} size={22} />
                        </TouchableOpacity>
                        <TouchableOpacity style={localStyles.socialIcon}>
                            <Youtube color={'#000'} size={22} />
                        </TouchableOpacity>
                        <TouchableOpacity style={localStyles.socialIcon}>
                            <Facebook color={'#000'} size={22} />
                        </TouchableOpacity>
                    </View>
                    <Text style={localStyles.footerCopy}>© 2025 agispare . V2</Text>
                </View>

            </ScrollView>
        </>
    );
};

export default Home;

// Demo/placeholder data for sections; replace with API later
const bestSellers = [
    { name: 'ORIGINAL SOLENOID SHUT OFF 12VDC', sku: '1001122145', meta: '800S, 860SJ,1200SJP,1350SJP' },
    { name: 'ORIGINAL SOLENOID SHUT OFF 24VDC', sku: '1001122146', meta: '340AJ, 450AJ, 600AJ' },
    { name: 'ORIGINAL JOYSTICK CONTROLLER', sku: '1001122147', meta: 'JLG, GENIE compatible' },
];

const partnerLogos = [
    require('../../../assets/images/brands/adani.png'),
    require('../../../assets/images/brands/birla.png'),
    require('../../../assets/images/brands/anns.png'),
    require('../../../assets/images/brands/larsen.png'),
    require('../../../assets/images/brands/tata_steel.png'),
    require('../../../assets/images/brands/jlg.png'),
    require('../../../assets/images/brands/genie.png'),
    require('../../../assets/images/brands/tata_pigments.png'),
];

const localStyles = StyleSheet.create({
    searchContainer: {
        marginHorizontal: widthPixel(16),
        backgroundColor: '#FFFFFF',
        height: heightPixel(40),
        borderRadius: widthPixel(24),
        paddingHorizontal: widthPixel(12),
        alignItems: 'center',
        flexDirection: 'row',
        gap: widthPixel(8),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    searchPlaceholder: {
        color: '#8E8E8E',
        fontSize: heightPixel(14),
    },
    welcomeCard: {
        marginTop: heightPixel(16),
        marginHorizontal: widthPixel(16),
        backgroundColor: '#FFFFFF',
        borderRadius: widthPixel(12),
        padding: widthPixel(16),
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 2,
    },
    welcomeTitle: {
        fontSize: heightPixel(20),
        fontFamily: fontFamily.boldFont,
        color: '#4A4A68',
        textAlign: 'center',
        marginBottom: heightPixel(6),
    },
    welcomeSubtitle: {
        fontSize: heightPixel(14),
        fontFamily: fontFamily.semiBoldFont,
        color: '#4A4A68',
        textAlign: 'center',
        marginBottom: heightPixel(10),
    },
    welcomeBody: {
        fontSize: heightPixel(12),
        fontFamily: fontFamily.regularFont,
        color: '#605E5E',
        textAlign: 'left',
        lineHeight: heightPixel(18),
    },
    categorySection: {
        marginTop: heightPixel(16),
        backgroundColor: '#1D1A44',
        paddingVertical: heightPixel(20),
        // borderTopLeftRadius: widthPixel(20),
        // borderTopRightRadius: widthPixel(20),
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: heightPixel(22),
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: heightPixel(16),
    },
    categoryGrid: {
        paddingHorizontal: widthPixel(16),
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: heightPixel(12),
    },
    categoryCard: {
        width: (DEVICE_WIDTH - widthPixel(16) * 2.5 - widthPixel(12)) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: widthPixel(14),
        padding: widthPixel(12),
    },
    categoryImage: {
        width: '100%',
        height: heightPixel(110),
        borderRadius: widthPixel(8),
        backgroundColor: '#F7F7F7',
    },
    categoryFooter: {
        marginTop: heightPixel(8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryText: {
        color: '#1F2024',
        fontSize: heightPixel(14),
        fontWeight: '700',
        marginRight: widthPixel(5),
    },
    loadMore: {
        alignSelf: 'center',
        marginTop: heightPixel(16),
        backgroundColor: '#F2994A',
        borderRadius: widthPixel(24),
        paddingHorizontal: widthPixel(20),
        paddingVertical: heightPixel(10),
    },
    loadMoreText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Best Sellers
    bestSellersSection: {
        backgroundColor: '#FFFFFF',
        paddingTop: heightPixel(16),
        paddingBottom: heightPixel(12),
    },
    bestSellersTitle: {
        color: '#4A4A68',
        fontSize: heightPixel(20),
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: heightPixel(12),
    },
    bestCard: {
        width: DEVICE_WIDTH * 0.62,
        backgroundColor: '#fff',
        marginHorizontal: widthPixel(6),
        borderRadius: widthPixel(12),
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.08)'
    },
    bestImage: {
        width: '100%',
        height: heightPixel(140),
        backgroundColor: '#F7F7F7'
    },
    bestName: {
        color: '#4A4A68',
        fontWeight: '700',
        fontSize: heightPixel(13),
    },
    bestSku: {
        marginTop: heightPixel(6),
        color: '#4A4A68',
        fontSize: heightPixel(12),
        opacity: 0.9
    },
    bestMeta: {
        color: '#8E8E8E',
        fontSize: heightPixel(11),
        marginTop: heightPixel(2)
    },

    // Partners
    partnersSection: {
        backgroundColor: '#F6F6FA',
        paddingVertical: heightPixel(18),
    },
    partnersTitle: {
        color: '#2C2B49',
        textAlign: 'center',
        fontWeight: '800',
        fontSize: heightPixel(20),
        marginBottom: heightPixel(6),
    },
    partnersSubtitle: {
        textAlign: 'center',
        color: '#605E5E',
        fontSize: heightPixel(12),
        marginBottom: heightPixel(12)
    },
    partnersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: widthPixel(16),
        rowGap: heightPixel(12)
    },
    partnerBox: {
        width: (DEVICE_WIDTH - widthPixel(16) * 2 - widthPixel(12)) / 2,
        height: heightPixel(70),
        borderRadius: widthPixel(12),
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EEE'
    },
    // partnerName removed in favor of logos

    // Success
    successSection: {
        backgroundColor: '#FFFFFF',
        paddingVertical: heightPixel(18)
    },
    successTitle: {
        color: '#2C2B49',
        textAlign: 'center',
        fontWeight: '800',
        fontSize: heightPixel(20),
        marginBottom: heightPixel(6),
    },
    successSubtitle: {
        textAlign: 'center',
        color: '#605E5E',
        fontSize: heightPixel(12),
        marginBottom: heightPixel(12)
    },
    quoteCard: {
        backgroundColor: '#F7F7FB',
        marginHorizontal: widthPixel(16),
        borderRadius: widthPixel(12),
        padding: widthPixel(16),
        minHeight: heightPixel(120)
    },
    quoteMark: {
        fontSize: heightPixel(24),
        color: '#4A4A68',
        marginBottom: heightPixel(6)
    },
    quoteText: {
        color: '#4A4A68',
        fontSize: heightPixel(12),
        lineHeight: heightPixel(18)
    },
    quoteAuthor: {
        color: '#2C2B49',
        fontSize: heightPixel(11),
        fontWeight: '600',
        marginTop: heightPixel(8),
        fontStyle: 'italic'
    },

    // Socials
    socialSection: {
        backgroundColor: '#FFFFFF',
        paddingVertical: heightPixel(18),
        alignItems: 'center'
    },
    socialTitle: {
        color: '#2C2B49',
        fontWeight: '800',
        fontSize: heightPixel(20),
        marginBottom: heightPixel(10)
    },
    socialRow: {
        flexDirection: 'row',
        gap: widthPixel(18),
        marginBottom: heightPixel(10)
    },
    socialIcon: {
        width: widthPixel(36),
        height: widthPixel(36),
        borderRadius: widthPixel(18),
        borderWidth: 1,
        borderColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center'
    },
    footerCopy: {
        color: '#8E8E8E',
        fontSize: heightPixel(12)
    }
});