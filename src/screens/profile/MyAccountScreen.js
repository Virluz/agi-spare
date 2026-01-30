import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { _getVerticalPadding } from '../../utils/Helper';
import FastImage from '@d11/react-native-fast-image';
import Toolbar from '../../components/ui/Toolbar';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { PrimaryButtonSmall } from '../../components/ui/PrimaryButtonSmall';
import { ArrowRight, Home, HomeIcon, LucideHome, Navigation } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { checkCustomerAuth } from '../../graphql/customerAuth';
import { setCustomerDefaultAddress } from '../../graphql/graph_request';
import { getAuthToken } from '../../utils/customerAuth';
import { clearAuthToken } from '../../utils/customerAuth';
import { t } from 'i18next';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyAccountScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const { colorScheme } = useSelector(state => state.app);
  const [isLoading, setIsLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null);

  const styles = AppStyles.getAllStyles(colorScheme);
  const colorSet = AppStyles.colorSet[colorScheme];

  useEffect(() => {
    checkAuthStatus();

    fetchAvatar();
  }, []);


  const fetchAvatar = async () => {

    const savedAvatar = await AsyncStorage.getItem('customerAvatarUri');
    if (savedAvatar) setAvatarUri(savedAvatar);
  }


  // Re-check auth whenever this screen gains focus (e.g., after closing Login)
  useEffect(() => {
    if (isFocused) {
      checkAuthStatus();
    }
  }, [isFocused]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const customer = await checkCustomerAuth();
      setCustomerData(customer);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setCustomerData(null);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await clearAuthToken();
      setCustomerData(null);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSetDefault = async (addressId) => {
    try {
      setSettingDefaultId(addressId);
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      await setCustomerDefaultAddress(token, addressId);
      await checkAuthStatus(); // refresh customer data
    } catch (e) {
      console.error('Failed to set default address:', e);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const refContactSheet = useRef(null);

  const openContactSheet = () => {
    if (refContactSheet.current) refContactSheet.current.open();
  };

  // Contact actions
  const SUPPORT_PHONE = '+919429692121';
  const SUPPORT_EMAIL = 'sharewith.in';
  const LEGAL_EMAIL = 'compliarse.com';
  const FRANCHISE_URL = 'hise-enquiry'; // Assumed URL
  const BUSINESS_PARTNER_URL = 'usiness-partner-form'; // Assumed URL

  const openDialer = async (phone) => {
    const url = `tel:${phone}`;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url); else Alert.alert('Unable to open dialer');
    } catch (e) { Alert.alert('Error', 'Could not open dialer'); }
  };

  const openEmail = async (email) => {
    const url = `mailto:${email}`;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url); else Alert.alert('No mail app available');
    } catch (e) { Alert.alert('Error', 'Could not open mail app'); }
  };

  const openWebPage = (title, url) => {
    if (!url) return;
    navigation.navigate('WebViewScreen', { title, url });
    if (refContactSheet.current) refContactSheet.current.close();
  };

  const menuItems = [
    { icon: require('../../../assets/images/account/order.png'), name: 'My Orders', navigateTo: 'MyOrders', requiresAuth: true },
    { icon: require('../../../assets/images/account/whishlist.png'), name: 'My Wishlist', navigateTo: 'Wishlist', requiresAuth: true },
    { icon: require('../../../assets/images/account/notification.png'), name: 'My Notifications', navigateTo: 'Notifications', requiresAuth: true, showBadge: true },
    { icon: require('../../../assets/images/account/rewards.png'), name: 'My Rewards', requiresAuth: true },
    { icon: require('../../../assets/images/account/wallet.png'), name: 'My Wallets', requiresAuth: true },
    { icon: require('../../../assets/images/account/share.png'), name: 'Share App', requiresAuth: false },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container_no_padding, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colorSet.primaryColor} />
      </View>
    );
  }

  if (!customerData) {
    return (
      <View style={styles.container_no_padding}>
        <Toolbar title="My Account" />
        <View style={localStyles.loginContainer}>
          <FastImage
            source={require('../../../assets/images/user.png')}
            style={localStyles.loginImage}
          />
          <Text style={[styles.text_18_semi_mainTextColor2, { marginVertical: heightPixel(20) }]}>
            Login to access your account
          </Text>
          <Text style={[styles.text_14_reg_mainTextColor2, { textAlign: 'center', marginBottom: heightPixel(20) }]}>
            Sign in to view your profile, orders, wishlist and more
          </Text>

          <PrimaryButton
            title="LOGIN / SIGNUP"
            onPress={handleLogin}
          />
        </View>

        <View style={localStyles.menuContainer}>
          {menuItems.filter(item => !item.requiresAuth).map((item, index) => (
            <TouchableOpacity key={index} style={localStyles.menuItem} onPress={() => {
              return item.navigateTo && navigation.navigate(item.navigateTo);
            }}>
              <View style={localStyles.menuItemLeft}>
                <Image source={item.icon} style={localStyles.menuIcon} />
                <Text style={styles.text_16_reg_mainTextColor2}>{item.name}</Text>
              </View>
              <Image source={require('../../../assets/images/account/arrow_right.png')} style={localStyles.menuArrow} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }


  return (
    <View style={styles.container_no_padding}>
      <Toolbar title="My Account" />
      <ScrollView>
        <View style={localStyles.profileSection}>
          <View>
            <Text style={styles.text_16_reg_mainTextColor2}>
              {customerData.firstName} {customerData.lastName}
            </Text>
            <Text style={[styles.text_14_reg_mainTextColor2, { marginTop: 4 }]}>
              {customerData.email}
            </Text>
            <PrimaryButtonSmall
              title="EDIT PROFILE"
              onPress={() => navigation.navigate('EditProfile')}
            />
          </View>
          <FastImage
            source={avatarUri ? { uri: avatarUri } : require('../../../assets/images/user.png')}
            style={localStyles.profileImage}
          />
        </View>

        <View style={localStyles.sectionContainer}>
          <Text style={styles.text_16_reg_mainTextColor2}>My Addresses</Text>
          {_getVerticalPadding(10)}
          {customerData.defaultAddress ? (
            <View style={localStyles.addressCard}>
              <Image source={require('../../../assets/images/account/home.png')} style={localStyles.addressIcon} />
              <View style={localStyles.addressDetails}>
                <Text style={styles.text_16_semi_mainTextColor2}>Default Address</Text>
                <Text style={styles.text_14_reg_mainTextColor2}>
                  {`${customerData.defaultAddress.address1}, ${customerData.defaultAddress.city}, ${customerData.defaultAddress.province} - ${customerData.defaultAddress.zip}`}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('EditAddress', { address: customerData.defaultAddress })}>
                <Image source={require('../../../assets/images/account/pencil.png')} style={localStyles.editIcon} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.text_14_reg_mainTextColor2}>No address saved yet.</Text>
          )}

          {/* Other addresses */}
          {Array.isArray(customerData?.addresses?.edges) && customerData.addresses.edges
            .filter(({ node }) => node.id !== customerData?.defaultAddress?.id)
            .map(({ node }) => (
              <View key={node.id} style={localStyles.addressCard}>
                <Image source={require('../../../assets/images/account/home.png')} style={localStyles.addressIcon} />
                <View style={localStyles.addressDetails}>
                  <Text style={styles.text_16_semi_mainTextColor2}>{node.firstName || ''} {node.lastName || ''}</Text>
                  <Text style={styles.text_14_reg_mainTextColor2}>
                    {`${node.address1}${node.address2 ? ', ' + node.address2 : ''}, ${node.city}, ${node.province} - ${node.zip}`}
                  </Text>
                  <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 4 }]}>{node.country}</Text>
                  <TouchableOpacity
                    onPress={() => handleSetDefault(node.id)}
                    disabled={settingDefaultId === node.id}
                    style={{ marginTop: heightPixel(6), alignSelf: 'flex-start' }}
                  >
                    <Text style={[styles.text_12_reg_mainTextColor2, { color: colorSet.primaryColor, textDecorationLine: 'underline' }]}>
                      {settingDefaultId === node.id ? 'Setting…' : 'Make default'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('EditAddress', { address: node })}>
                  <Image source={require('../../../assets/images/account/pencil.png')} style={localStyles.editIcon} />
                </TouchableOpacity>
              </View>
            ))}

          <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}>
            <Text style={[styles.text_14_semi_mainTextColor2, { textAlign: 'right', textDecorationLine: 'underline', marginTop: 10 }]}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        <View style={localStyles.menuContainer}>
          {menuItems.map((item, index) => {
            // Placeholder notification count (replace with real unread count from state)
            const notificationCount = item.showBadge ? 3 : 0;
            return (
              <TouchableOpacity key={index} style={localStyles.menuItem} onPress={() => {
                if (item.openSheet) return openContactSheet();
                return item.navigateTo && navigation.navigate(item.navigateTo, { url: item?.url, title: item?.title });
              }}>
                <View style={localStyles.menuItemLeft}>
                  <View style={{ position: 'relative' }}>
                    <Image source={item.icon} style={localStyles.menuIcon} />
                    {notificationCount > 0 && (
                      <View style={localStyles.badgeContainer}>
                        <Text style={localStyles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.text_16_reg_mainTextColor2}>{item.name}</Text>
                </View>
                <Image source={require('../../../assets/images/account/arrow_right.png')} style={localStyles.menuArrow} />
              </TouchableOpacity>
            )
          })}

          <TouchableOpacity style={localStyles.menuItem} onPress={handleLogout}>
            <View style={localStyles.menuItemLeft}>
              <Image source={require('../../../assets/images/account/arrow_right.png')} style={localStyles.menuIcon} />
              <Text style={[styles.text_16_reg_mainTextColor2, { color: colorSet.red }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {_getVerticalPadding(40)}
      </ScrollView>
      <RBSheet
        ref={refContactSheet}
        height={heightPixel(300)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: widthPixel(20),
            borderTopRightRadius: widthPixel(20),
            padding: widthPixel(20),
          }
        }}
      >
        {/* Empty sheet placeholder */}
        <View style={{ flex: 1 }}>
          <Text style={styles.text_16_semi_mainTextColor2}>Contact Us</Text>
          {_getVerticalPadding(10)}

          <TouchableOpacity onPress={() => openDialer(SUPPORT_PHONE)}>
            <Text style={[styles.text_14_semi_mainTextColor2]}>Customer care number - <Text style={[styles.text_14_reg_mainTextColor2, { color: colorSet.primaryColor, textDecorationLine: 'underline' }]}>+91 9429692121</Text></Text>
          </TouchableOpacity>
          {_getVerticalPadding(6)}

          <TouchableOpacity onPress={() => openEmail(SUPPORT_EMAIL)}>
            <Text style={[styles.text_14_semi_mainTextColor2]}>Customer care email - <Text style={[styles.text_14_reg_mainTextColor2, { color: colorSet.primaryColor, textDecorationLine: 'underline' }]}>{SUPPORT_EMAIL}</Text></Text>
          </TouchableOpacity>
          {_getVerticalPadding(6)}

          <Text style={[styles.text_14_reg_mainTextColor2, { textAlign: 'center' }]}>10:30 am to 6:30 pm from Monday to Friday</Text>

          {_getVerticalPadding(10)}

          <TouchableOpacity onPress={() => openEmail(LEGAL_EMAIL)}>
            <Text style={[styles.text_14_semi_mainTextColor2]}>Legal - <Text style={[styles.text_14_reg_mainTextColor2, { color: colorSet.primaryColor, textDecorationLine: 'underline' }]}>{LEGAL_EMAIL}</Text></Text>
          </TouchableOpacity>

          {_getVerticalPadding(12)}

          <TouchableOpacity onPress={() => openWebPage('Franchise Enquiry', FRANCHISE_URL)}>
            <Text style={[styles.text_14_semi_mainTextColor2, { color: colorSet.primaryColor, textDecorationLine: 'underline' }]}>Franchise Enquiry</Text>
          </TouchableOpacity>
          {_getVerticalPadding(8)}
          <TouchableOpacity onPress={() => openWebPage('Business Partner Form', BUSINESS_PARTNER_URL)}>
            <Text style={[styles.text_14_semi_mainTextColor2, { color: colorSet.primaryColor, textDecorationLine: 'underline' }]}>Business Partner Form</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
  );
};

const localStyles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: widthPixel(20),
    paddingVertical: heightPixel(40),
  },
  loginImage: {
    width: widthPixel(100),
    height: widthPixel(100),
    borderRadius: widthPixel(50),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPixel(20),
    backgroundColor: '#fff',
    paddingVertical: heightPixel(20),
  },
  profileImage: {
    width: widthPixel(70),
    height: heightPixel(70),
    borderRadius: widthPixel(35),
  },
  sectionContainer: {
    backgroundColor: '#FFF4EF',
    paddingHorizontal: widthPixel(20),
    paddingVertical: heightPixel(20),
    marginTop: heightPixel(10),
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: heightPixel(15),
    paddingVertical: heightPixel(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F6C3C6',
  },
  addressIcon: {
    width: widthPixel(16),
    height: heightPixel(16),
    resizeMode: 'contain',
    marginRight: widthPixel(10),
    marginTop: heightPixel(5),
  },
  addressDetails: {
    flex: 1,
  },
  editIcon: {
    width: widthPixel(16),
    height: heightPixel(16),
    resizeMode: 'contain',
    marginLeft: widthPixel(10),
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: heightPixel(10),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPixel(20),
    paddingVertical: heightPixel(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: widthPixel(20),
    height: heightPixel(20),
    resizeMode: 'contain',
    marginRight: widthPixel(15),
  },
  menuArrow: {
    width: widthPixel(20),
    height: heightPixel(16),
    resizeMode: 'contain',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: 8,
    backgroundColor: '#FF3B30',
    minWidth: widthPixel(16),
    height: widthPixel(16),
    borderRadius: widthPixel(8),
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default MyAccountScreen;