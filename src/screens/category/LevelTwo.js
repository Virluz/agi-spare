import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toolbar from '../../components/ui/Toolbar';
import { _getVerticalPadding, DEVICE_WIDTH, getHandleFromURL, HalfCircle } from '../../utils/Helper';
import FastImage from '@d11/react-native-fast-image';
import { BlurView } from '@react-native-community/blur';
import { heightPixel } from '../../utils/fonts';
import { FlatList } from 'react-native-gesture-handler';
import SectionName from '../../components/ui/home/SectionName';
import ShopTheLook from '../home/ShopTheLook';
import ShopBestSellers from '../home/StoreBestSellers';
import BestSeller from './BestSeller';
import ShopBy from './ShopBy';
import AlsoLookFor from '../home/AlsoLookFor';
import Care from '../home/Care';

// const Tab = createMaterialTopTabNavigator();



const LevelTwo = () => {
  const route = useRoute();
  const { menuItems, title } = route.params;
  const [activeTab, setActiveTab] = useState(menuItems[0]?.id);
  const navigation = useNavigation();

  const { colorScheme } = useSelector(state => state.app);
  const styles = AppStyles.getAllStyles(colorScheme);
  const colorSet = AppStyles.colorSet[colorScheme];



  const renderTrendingCategoryItem = ({ item }) => {
    console.log("ITEMS", item);

    return (
      <TouchableOpacity style={localStyles.trendingCategoryItem} onPress={() => {
        const handle = getHandleFromURL(item?.url)

        console.log("HANDLE", handle);


        if (handle) {

          navigation.navigate('ProductList', {
            handle,
            title: item?.title
          });
        }
      }}>
        <View style={localStyles.trendingCategoryImageContainer}>
          <FastImage
            source={item.resource ? (item.resource.image ? { uri: item.resource.image.url } : require('../../../assets/images/home/store_photo.png')) : require('../../../assets/images/home/store_photo.png')}
            style={localStyles.trendingCategoryImage}
            resizeMode="contain"
          >


          </FastImage>
        </View>
        <Text style={[styles.text_12_reg_mainTextColor2, {
          textAlign: 'center', color: 'red'
        }]}>{item?.title}</Text>


        <HalfCircle />

      </TouchableOpacity>
    );
  };

  return (
    <>

      <Toolbar title={title} />

      <ScrollView style={localStyles.contentContainer}>


        {/* <BlurView
          style={{

            position: 'absolute', top: 180 + heightPixel(54),
            left: 0, right: 0, bottom: 0,
          }}
          overlayColor={'rgba(231, 226, 226, 0.2)'}
          blurType="light"
          blurAmount={30}
        /> */}

        {/* <ScrollView style={{ flex: 1, }}> */}

        <FastImage
          style={{ height: 200, width: '100%' }}
          // resizeMode='contain'
          source={require('../../../assets/images/category/leveltwo.png')}
        />


        {/* <View style={{ height: 20 }}> */}



        {/* </View > */}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={localStyles.tabBarScroll}>


          {menuItems?.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[localStyles.tabItem, activeTab === item.id && localStyles.activeTabItem]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text style={[styles.textRegular, localStyles.tabText, activeTab === item.id && localStyles.activeTabText]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {menuItems?.map((item) => {
          const categories = activeTab === item.id ? item?.items : [];
          return (
            <View style={{ flexDirection: 'row' }}>

              <FlatList
                data={categories}
                renderItem={renderTrendingCategoryItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={localStyles.trendingCategoriesContainer}
              />

            </View>
          );
        })}

        <SectionName title={'Shop By Age'} />

        <ShopBy />

        <BestSeller />

        <AlsoLookFor />

        <Care />

        {_getVerticalPadding(80)}

      </ScrollView>

    </>

  );
};

const localStyles = StyleSheet.create({
  levelThreeContainer: {
    flex: 1,
    // backgroundColor: 'red',
    padding: 15,
  },
  levelThreeItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  levelThreeText: {
    fontSize: 16,
  },
  tabBarScroll: {
    height: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tabItem: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'grey',
  },
  activeTabText: {
    color: 'black',
  },
  contentContainer: {
    flex: 1,
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
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LevelTwo;