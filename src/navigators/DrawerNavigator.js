import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { BottomTabs } from './BottomTabs';
import AppStyles from '../styles/AppStyles';
import { useSelector } from 'react-redux';
import { /* DrawerActions, useNavigation */ } from '@react-navigation/native';
import { User, ShoppingBag, Heart, Tag, Gift, Settings, Info, LogOut, Home, ChevronRight, Plus, Minus, ChevronLeft } from 'lucide-react-native';
import { widthPixel } from '../utils/fonts';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { getHandleFromURL } from '../utils/Helper';
import ProductList from '../screens/product/ProductList';
import AccountContainer from './AccountContainer';
import SearchPage from '../screens/profile/SearchPage';

const Drawer = createDrawerNavigator();

import { getMenu } from '../graphql/queries/menu/menuQuery';
import Loader from '../widgets/Loader';
import WebPage from '../screens/drawer/WebPage';
import SearchResultsPage from '../screens/profile/SearchResultsPage';
import Wishlist from '../screens/profile/Wishlist';
import Notifications from '../screens/profile/Notifications';

// Custom drawer content component
const CustomDrawerContent = (props) => {
  const { colorScheme } = useSelector(state => state.app);
  const styles = AppStyles.getAllStyles(colorScheme);
  const { navigation } = props;
  const colorSet = AppStyles.colorSet[colorScheme];

  const [expandedMenus, setExpandedMenus] = useState({});
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await getMenu({ handle: "react-native-mobile-app" });
      setMenuData(response);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prevState => ({
      ...prevState,
      [menuKey]: !prevState[menuKey],
    }));
  };

  const MenuItem = ({ icon, text, onPress, showPlusMinus = false, isExpanded = false, level = 0, children }) => (
    <>
      <TouchableOpacity style={[drawerStyles.menuItemContainer, { paddingLeft: 15 + level * 20 }]} onPress={onPress ? onPress : () => showPlusMinus && toggleMenu(text)}>
        {icon && <View style={drawerStyles.iconContainer}>{icon}</View>}
        <Text style={[styles.text_16_reg_mainTextColor2, drawerStyles.menuItemText]}>{text}</Text>
        {showPlusMinus && (
          <View style={drawerStyles.plusMinusIcon}>
            {isExpanded ? <Minus size={widthPixel(18)} color={colorSet.black} /> : <Plus size={widthPixel(18)} color={colorSet.black} />}
          </View>
        )}
      </TouchableOpacity>
      {isExpanded && children}
    </>
  );

  const renderMenuItems = (items, level) => {
    return items.map((item) => (
      <MenuItem
        key={item.id}
        icon={item.title === "Women" || item.title === "Men" || item.title === "Kids" ? <User size={widthPixel(20)} color={colorSet.black} /> : null}
        text={item.title}
        onPress={() => {
          if (item.items && item.items.length > 0) {
            setExpandedMenus(
              prevState => ({
                ...prevState,
                [item?.title]: !prevState[item?.title],
              })
            )
            return;
          }

          const handle = getHandleFromURL(item?.url)

          console.log("HANDLE", handle);


          if (handle) {
            navigation.navigate('ProductList',
              {
                handle,
                title: item?.title,
              },
            );

          }
        }}
        showPlusMinus={item.items && item.items.length > 0}
        isExpanded={expandedMenus[item.title]}
        level={level}
      >
        {item.items && item.items.length > 0 && renderMenuItems(item.items, level + 1)}
      </MenuItem >
    ));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={drawerStyles.container}>
      <View style={drawerStyles.header}>
        <Image
          source={require('../../assets/images/style_union_logo.png')}
          style={drawerStyles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={{
            backgroundColor: 'white', height: 50,
            alignItems: 'center', justifyContent: 'center'
          }}
          onPress={() => {
            navigation.closeDrawer();
          }}>
          <ChevronLeft />
        </TouchableOpacity>
      </View>
      <ScrollView style={drawerStyles.content}>
        <Text style={[styles.text_12_reg_mainTextColor2, drawerStyles.sectionTitle]}>Featured Collections</Text>
        <MenuItem text="So Much So Less" onPress={() => { }} />
        <MenuItem text="FluidX" onPress={() => { }} />
        <MenuItem text="Repant" onPress={() => { }} />
        <MenuItem text="AirDry" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://styleunion.in/pages/airdry-collection', title: 'AirDry' }) }} />
        <MenuItem text="Travel Friendly Products" onPress={() => { navigation.navigate('ProductList', { handle: 'travel-collection-men', title: 'Travel Friendly Products' }) }} />
        <MenuItem text="Women Sleepwear" onPress={() => { }} />
        <MenuItem text="Union of Denim" onPress={() => { }} />
        <MenuItem text="Graphic Tees" onPress={() => { }} />

        <View style={drawerStyles.divider} />

        {menuData?.menu?.items && renderMenuItems(menuData.menu.items, 0)}

        <View style={drawerStyles.divider} />

        <MenuItem icon={<Tag size={widthPixel(20)} color={colorSet.black} />} text="New In" onPress={() => { navigation.navigate('ProductList', { handle: 'new-in', title: 'New In' }) }} />
        <MenuItem icon={<Info size={widthPixel(20)} color={colorSet.black} />} text="Blogs" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://styleunion.in/blogs/fashion', title: 'Blogs' }) }} />
        <MenuItem icon={<Settings size={widthPixel(20)} color={colorSet.black} />} text="Customised Solutions" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://unitees.styleunion.in/?_gl=1*1eklc2o*_gcl_aw*R0NMLjE3NjAzNjMyNjMuQ2p3S0NBand4ckxIQmhBMkVpd0F1OUVkTTNpNXVDcUVoeDU4Mzc1bVpxTFUzWk1JemR1VlZDajdvOEhFSjhfaXZadW1yVHpUY0xNQ3pCb0MwY0lRQXZEX0J3RQ..*_gcl_au*MTAyMzc2Mzc4LjE3NjAzNjMyNTM.', title: 'Customised Solutions' }) }} />
        <MenuItem icon={<Home size={widthPixel(20)} color={colorSet.black} />} text="Store Locator" onPress={() => { navigation.navigate('WebViewScreen', { url: 'https://stores.styleunion.in/?companyid=b9b7523c-fdfa-4f42-a618-d6da6a458bd3', title: 'Store Locator' }) }} />

        <View style={drawerStyles.divider} />

      </ScrollView>
      <View style={drawerStyles.bottomContainer}>
        <PrimaryButton title="SIGN IN / SIGN UP" onPress={() => { }} />
      </View>
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
        },
      }}
    >
      <Drawer.Screen name="HomeDrawer" component={BottomTabs} />


      <Drawer.Screen
        options={{
          headerShown: false,
          tabBarStyle: { display: 'none' }
        }}
        name="AccountContainer"
        component={AccountContainer}
      />



      <Drawer.Screen
        name="SearchPage"
        component={SearchPage}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />


      <Drawer.Screen
        name="SearchResultsPage"
        component={SearchResultsPage}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />


      <Drawer.Screen
        name="WebViewScreen"
        component={WebPage}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />


      <Drawer.Screen
        name="Wishlist"
        component={Wishlist}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />

      <Drawer.Screen
        name="Notifications"
        component={Notifications}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />



    </Drawer.Navigator>
  );
};

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  header: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // alignItems: 'center',
    borderBottomWidth: 1,
    paddingLeft: widthPixel(16),
    borderBottomColor: '#E2E2E2',
  },
  logo: {
    width: 150,
    height: 50,
    tintColor: 'black'
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    marginTop: 20,
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  iconContainer: {
    marginRight: 10,
    width: 24,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
  plusMinusIcon: {
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 15,
  },
  bottomContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
});

export default DrawerNavigator;