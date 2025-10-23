import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import Toolbar from '../../components/ui/Toolbar';
import { _getVerticalPadding, DEVICE_WIDTH, HalfCircle } from '../../utils/Helper';
import FastImage from '@d11/react-native-fast-image';
import { heightPixel, widthPixel } from '../../utils/fonts';
import Care from '../home/Care';
import ImageCarousel from '../../components/ui/home/ImageCarousel';
import { ZapIcon } from 'lucide-react-native';
import { getMenu } from '../../graphql/queries/menu/menuQuery';
import Loader from '../../widgets/Loader';

// Temporary placeholder until API data is loaded
const initialMenuData = {
  "menu": {
    "id": "gid://shopify/Menu/242799214841",
    "handle": "react-native-mobile-app",
    "items": [
      {
        "id": "gid://shopify/MenuItem/580470374649",
        "resourceId": null,
        "tags": [],
        "type": "HTTP",
        "title": "Men",
        "url": "`https://styleunion.in#`",
        "items": [
          {
            "id": "gid://shopify/MenuItem/580471947513",
            "resourceId": null,
            "tags": [],
            "type": "HTTP",
            "title": "Discover",
            "url": "`https://styleunion.in#`",
            "items": [
              {
                "id": "gid://shopify/MenuItem/580471980281",
                "resourceId": "gid://shopify/Collection/442330546425",
                "tags": [],
                "type": "COLLECTION",
                "title": "What's New",
                "url": "`https://styleunion.in/collections/new-arrivals-men`"
              },
              {
                "id": "gid://shopify/MenuItem/580472013049",
                "resourceId": "gid://shopify/Collection/445165895929",
                "tags": [],
                "type": "COLLECTION",
                "title": "Bestsellers",
                "url": "`https://styleunion.in/collections/bestseller-new-men`"
              }
            ]
          },
          {
            "id": "gid://shopify/MenuItem/580472045817",
            "resourceId": null,
            "tags": [],
            "type": "HTTP",
            "title": "Everyday Wear",
            "url": "`https://styleunion.in#`",
            "items": []
          },
          {
            "id": "gid://shopify/MenuItem/580472078585",
            "resourceId": null,
            "tags": [],
            "type": "HTTP",
            "title": "Business Basics",
            "url": "`https://styleunion.in#`",
            "items": []
          },
          {
            "id": "gid://shopify/MenuItem/580472111353",
            "resourceId": null,
            "tags": [],
            "type": "HTTP",
            "title": "Ethic Wear",
            "url": "`https://styleunion.in#`",
            "items": []
          },
          {
            "id": "gid://shopify/MenuItem/580472144121",
            "resourceId": null,
            "tags": [],
            "type": "HTTP",
            "title": "Athleisure",
            "url": "`https://styleunion.in#`",
            "items": []
          },
          {
            "id": "gid://shopify/MenuItem/580472176889",
            "resourceId": null,
            "tags": [],
            "type": "HTTP",
            "title": "Accessories",
            "url": "`https://styleunion.in#`",
            "items": []
          }
        ]
      },
      {
        "id": "gid://shopify/MenuItem/580471030009",
        "resourceId": null,
        "tags": [],
        "type": "HTTP",
        "title": "Women",
        "url": "`https://styleunion.in#`",
        "items": []
      },
      {
        "id": "gid://shopify/MenuItem/580471488761",
        "resourceId": null,
        "tags": [],
        "type": "HTTP",
        "title": "Kids",
        "url": "`https://styleunion.in#`",
        "items": []
      }
    ]
  }
};


const trendingCategoriesData = [
  {
    id: '1',
    title: 'Air Dry',
    image: require('../../../assets/images/home/women_new.png'),
  },
  {
    id: '2',
    title: 'Travel Friendly Products',
    image: require('../../../assets/images/home/women_new.png'),
  },
  {
    id: '3',
    title: 'Repant',
    image: require('../../../assets/images/home/women_new.png'),
  },
  {
    id: '4',
    title: 'Union of denim',
    image: require('../../../assets/images/home/women_new.png'),
  },
  {
    id: '5',
    title: 'Graphic Tees',
    image: require('../../../assets/images/home/women_new.png'),
  },
  {
    id: '6',
    title: 'Women Sleepwear',
    image: require('../../../assets/images/home/women_new.png'),
  },
];

const LevelOne = () => {
  const navigation = useNavigation();
  const { colorScheme } = useSelector(state => state.app);
  const styles = AppStyles.getAllStyles(colorScheme);
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);

  const [trendingCategories, setTrendingCategories] = useState([]);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const displayTitle = (title) => {
    if (!title) return '';
    const up = String(title).toUpperCase();
    return up === 'MEN' ? 'MENS' : up;
  };

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await getMenu({ handle: "react-native-mobile-app" });
      console.log("Menu Data:", response);

      setMenuData(response);


      const responseTrendingCat = await getMenu({ handle: "react-native-app-trending-categories" });
      // console.log("Menu Data:", responseTrendingCat);

      setTrendingCategories(responseTrendingCat.menu.items);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (item) => {

    if (item.items && item.items.length > 0) {
      navigation.navigate('LevelTwo', { menuItems: item.items, title: item.title });
    } else {
      // Handle navigation for items without sub-menus
      console.log('Navigating to:', item.title, item.url);
    }
  };

  const renderTrendingCategoryItem = ({ item }) => (
    <TouchableOpacity style={localStyles.trendingCategoryItem}>
      <View style={localStyles.trendingCategoryImageContainer}>
        <FastImage
          source={item?.resource ? { uri: item?.resource?.image?.url } : ""}
          style={localStyles.trendingCategoryImage}
          resizeMode="contain"
        >


        </FastImage>
      </View>
      <Text style={[styles.text_12_reg_mainTextColor2, { textAlign: 'center' }]}>{item?.title}</Text>


      <HalfCircle />

    </TouchableOpacity>
  );

  if (loading) {
    return (
      <>
        <Toolbar title={'Categories'} />
        <Loader />
      </>
    );
  }

  return (
    <>
      <Toolbar title={'Categories'} />
      <ScrollView style={localStyles.container} showsVerticalScrollIndicator={false} >

        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.text_20_secondaryFont_mainTextColor2, { color: '#D32F2F', letterSpacing: 1.5, marginVertical: heightPixel(8) }]}>TOP CATEGORIES</Text>

          {menuData.menu.items.map((item, index) => (
            <TouchableOpacity key={item.id} style={[localStyles.cardWrapper]} onPress={() => handlePress(item)}>
              {/* Card accent shadow plane */}
              <View style={localStyles.cardShadowPlane} />

              <FastImage
                source={index === 0 ? require('../../../assets/images/category/men_full.png') : index === 1 ? require('../../../assets/images/category/women_full.png') : require('../../../assets/images/category/kids_full.png')}
                style={localStyles.categoryCard}
                resizeMode='contain'
              />


            </TouchableOpacity>
          ))}

          {_getVerticalPadding(24)}

          <Text style={styles.text_20_secondaryFont_mainTextColor2}>

            TRENDING CATEGORIES

          </Text>

        </View>


        <FlatList
          data={trendingCategories}
          renderItem={renderTrendingCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={localStyles.trendingCategoriesContainer}
        />


        <Care />

        {_getVerticalPadding(100)}


      </ScrollView >


    </>
  );
};

export default LevelOne;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  categoryCard: {
    height: heightPixel(220),
    width: DEVICE_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: widthPixel(24),
    // backgroundColor: 'red'
  },
  cardShadowPlane: {
    position: 'absolute',
    height: heightPixel(10),
    width: DEVICE_WIDTH,
    // backgroundColor: '#000',
    opacity: 0.25,
    bottom: heightPixel(14),
    alignSelf: 'center',
    zIndex: -1,
    transform: [{ rotate: '-4deg' }],
    borderRadius: 10,
  },
  categoryTitle: {
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'left',
    width: '70%',
  },
  ctaCircle: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderRadius: 25,
    bottom: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // soft outer shadow like screenshot
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaCircleInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EDEDED',
    opacity: 0.96,
    borderRadius: 25,
  },
  menuItemText: {
    fontSize: 18,
  },
  trendingCategoriesContainer: {
    paddingHorizontal: 5,
    marginTop: 10,
  },
  trendingCategoryItem: {
    flex: 1,
    alignItems: 'center',
    margin: 5,
  },
  trendingCategoryImageContainer: {
    width: DEVICE_WIDTH / 3 - 20, // Adjust based on desired spacing
    height: DEVICE_WIDTH / 3 - 20, // Make it square
    borderRadius: (DEVICE_WIDTH / 3 - 20) / 2, // Half of width/height for perfect circle
    overflow: 'hidden',
    // backgroundColor: '#F5F5F5', // Light grey background for the circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingCategoryImage: {
    width: '80%',
    height: '80%',
  },
  trendingCategoryText: {
    // marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});


