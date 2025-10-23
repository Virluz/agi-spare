import { Platform, Dimensions, useColorScheme, StyleSheet } from 'react-native';
import fonts, { fontPixel, heightPixel, widthPixel } from '../utils/fonts';
import { DEVICE_WIDTH } from '../utils/Helper';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const lightColorSet = {
  mainThemeBackgroundColor: '#fff',
  mainThemeForegroundColor: '#333333',
  mainTextColor: '#aaaaaa',
  mainTextColor2: '#121212',
  secondTextColor2: '#343434',
  mainTextColor3: '#FFFFFF',
  EarningMsgColor: '#E89739',

  mainSubtextColor: '#666666',
  responseColor: '#606060',
  SecondaryColor: '#FFFFFF',

  blue: '#006FFD',
  blue1: '#2897FF',
  blue2: '#6FBAFF',
  blue3: '#B4DBFF',
  blue4: '#EAF2FF',
  blue5: '#2573E8',
  // Light
  light: '#C5C6CC',

  light1: '#D4D6DD',
  light2: '#E8E9F1',
  light3: '#F8F9FE',
  light4: '#FFFFFF',
  // Green
  green: '#298267',
  green1: '#3AC0A0',
  green2: '#E7F4E8',
  green4: '#0C8B2F',
  green3: '#1BC741',
  darkGreen: '#264843',
  green5: '#10AE3C',
  green6: '#1A8F73',


  // Warning
  orange: '#E86339',
  orange: '#FFB37C',
  orange: '#FFF4E4',
  orange2: '#e89739',
  orange3: '#FFC700',

  // Error
  red0: '#ED3241',
  red1: '#FF616D',
  red2: '#FFE2E5',
  red4: '#E14345',
  red5: '#FFEEEE',
  primaryColor: '#D30027',

  urgent: '#D12122',
  red: '#F00000',
  lightGrey: "#f8f9fe",

  dark: '#1F2024',
  dark1: '#2F3036',
  dark2: '#494A50',
  dark3: '#8c8c8c',
  dark4: '#8F9098',
  dark5: '#292d32',
  dark6: '#565656',

  dark7: '#E8E8E8',
  dark8: '#BBBBBB',

  white: '#FFFFFF',
  black: '#1F2024',
  darkGrey: '#494A50',
  buttonText: '#fff',
  successColor: '#DEF9E5',
  failedColor: '#FFF8DF',
  qcFailedColor: '#FF616D',
  borderColor: '#dddddd',
  respondedBg: '#1ED760',
  expireBg: '#999999',
  separator: '#D2D2D2',
  invert1: '#FFFFFF',
  invert2: '#0159B1',
  static_white: '#fff',
  static_black: '#000'
};

const darkColorSet = {
  mainThemeBackgroundColor: '#1F2024',
  mainThemeForegroundColor: '#FFF',
  mainTextColor: '#FFF',
  mainTextColor2: '#fff',
  mainTextColor3: '#121212',
  EarningMsgColor: '#E89739',
  secondTextColor2: '#e8e8e8',
  mainSubtextColor: '#666666',
  responseColor: '#fff',

  SecondaryColor: '#FFFFFF',

  blue: '#006FFD',
  blue1: '#2897FF',
  blue2: '#6FBAFF',
  blue3: '#B4DBFF',
  blue4: '#EAF2FF',
  blue5: '#2573E8',
  // Light
  light: '#8f9098',
  light1: '#71727a',
  light2: '#494150',
  light3: '#2F3036',
  light4: '#1f2024',
  // Green
  green: '#298267',
  green1: '#3AC0A0',
  green2: '#E7F4E8',
  green4: '#0C8B2F',
  green3: '#1BC741',
  darkGreen: '#264843',
  green5: '#10AE3C',
  green6: '#1A8F73',


  // Warning
  orange: '#E86339',
  orange: '#FFB37C',
  orange: '#FFF4E4',
  orange2: '#e89739',
  orange3: '#FFC700',

  // Error
  red0: '#ED3241',
  red1: '#FF616D',
  red2: '#FFE2E5',
  red4: '#E14345',
  red5: '#FFEEEE',
  primaryColor: '#D30027',


  urgent: '#D12122',
  red: '#F00000',
  lightGrey: "#2F3036",

  dark: '#fff',
  dark1: '#f8f9fe',
  dark2: '#e8e9f1',
  dark3: '#d4d6dd',
  dark4: '#f8f9fe',
  dark5: '#c5c6cc',
  dark6: '#565656',
  dark7: '#4A4A4A',
  dark8: '#777777',

  white: '#1F2024',
  black: '#FFFFFF',
  darkGrey: '#494A50',
  buttonText: '#fff',
  successColor: '#DEF9E5',
  failedColor: '#5E563B',
  qcFailedColor: '#FF616D',
  borderColor: '#dddddd',
  respondedBg: '#1ED760',
  expireBg: '#999999',
  separator: '#606060',
  invert1: '#0159B1',
  invert2: '#FFFFFF',
  static_white: '#fff',
  static_black: '#000'



};

const colorSet = {
  light: lightColorSet,
  dark: darkColorSet,
  'no-preference': lightColorSet,
  'system-default-light': lightColorSet,
  'system-default-dark': lightColorSet,
};

export const fontFamily = {
  // boldFont: 'NeueMontreal-Bold',
  // semiBoldFont: 'NeueMontreal-Medium',
  // regularFont: 'NeueMontreal-Regular',
  // boldFont: 'Metropolis-Bold',
  // semiBoldFont: 'Metropolis-SemiBold',
  // regularFont: 'Metropolis-Regular',

  boldFont: 'Campton-SemiBold',
  semiBoldFont: 'Campton-Medium',
  regularFont: 'Campton-Book',


  // boldFont: 'Campton-Book',
  // semiBoldFont: 'Campton-Book',
  // regularFont: 'Campton-Book',

  secondaryFont: 'Kino',
  // boldFont: 'Satoshi-Bold',
  // semiBoldFont: 'Satoshi-Medium',
  // regularFont: 'Satoshi-Regular',
};

const getToolbarStyle = () => {
  return {
    headerTitleStyle: {
      fontSize: fontPixel(14),
      color: colorSet['light'].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },
    headerTitleAlign: 'center',
    headerStyle: {
      elevation: 0,
      height: heightPixel(54),
    },
  }
}

const getAllStyles = (schemeFromParent) => {
  const scheme = schemeFromParent ?? 'light';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorSet[scheme].mainThemeBackgroundColor,
      backgroundColor: 'red',
      paddingHorizontal: widthPixel(16),
    },
    container_no_padding: {
      flex: 1,
      backgroundColor: colorSet[scheme].mainThemeBackgroundColor,
    },
    text_16_bold_red: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].red0,
      fontFamily: fontFamily.boldFont,
    },
    text_16_bold_red1: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].red1,
      fontFamily: fontFamily.boldFont,
    },
    text_24_bold_red: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].red0,
      fontFamily: fontFamily.boldFont,
    },
    lightContainer: {
      flex: 1,
      paddingTop: heightPixel(16),
      paddingHorizontal: widthPixel(16),
      backgroundColor: colorSet[scheme].light3,
    },
    lightProfileContainer: {
      flex: 1,
      paddingTop: heightPixel(16),
      backgroundColor: colorSet[scheme].light3,
    },

    containerCenter: {
      alignSelf: 'center',
      justifyContent: 'center',
      flex: 1,
      backgroundColor: colorSet[scheme].mainThemeBackgroundColor,
      paddingHorizontal: 20,
    },
    containerNoPadding: {
      flex: 1,
      backgroundColor: colorSet[scheme].mainThemeBackgroundColor,
    },
    drawerContainer: {
      flex: 1,
      backgroundColor: colorSet[scheme].mainThemeBackgroundColor,
      borderWidth: 0.5,
      borderColor: colorSet[scheme].primaryColor,
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      // flex: 1,
      height: heightPixel(48),
      borderWidth: widthPixel(1),
      borderRadius: heightPixel(12),
      borderColor: '#C5C6CC',
      borderStyle: 'solid',
      marginVertical: heightPixel(8),
      paddingHorizontal: widthPixel(16),
    },
    text_10_bold_light4: {
      letterSpacing: 0.5,
      fontSize: fontPixel(10),
      color: colorSet[scheme].light4,
      fontFamily: fontFamily.boldFont,
    },

    text_10_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(10),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },
    text_10_bold_dark3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(10),
      color: colorSet[scheme].dark3,
      fontFamily: fontFamily.boldFont,
    },

    text_12_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(12),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },

    text_10_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(10),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },
    text_12_bold_mainTextColor3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(12),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.boldFont,
    },
    text_10_bold_mainTextColor3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(10),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.boldFont,
    },
    text_10_bold_static_white: {
      letterSpacing: 0.5,
      fontSize: fontPixel(10),
      color: colorSet[scheme].static_white,
      fontFamily: fontFamily.boldFont,
    },
    text_12_bold_red: {
      letterSpacing: 0.5,
      fontSize: fontPixel(12),
      color: colorSet[scheme].red,
      fontFamily: fontFamily.boldFont,
    },

    text_12_bold_dark2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark2,
      fontFamily: fontFamily.boldFont,
    },
    text_12_bold_dark3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark3,
      fontFamily: fontFamily.boldFont,
    },

    text_11_bold_dark3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(11),
      color: colorSet[scheme].dark3,
      fontFamily: fontFamily.boldFont,
    },
    text_12_semi_urgent: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].urgent,
      fontFamily: fontFamily.semiBoldFont,
    },

    text_12_reg_mainTextColor2: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.regularFont,
    },

    text_12_reg_mainTextColor3: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.regularFont,
    },
    text_16_reg_mainTextColor3: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(16),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.regularFont,
    },
    text_12_reg_static_white: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].static_white,
      fontFamily: fontFamily.regularFont,
    },

    text_12_reg_static_black: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].static_black,
      fontFamily: fontFamily.regularFont,
    },
    text_12_bold_primary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(12),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.boldFont,
    },
    text_12_reg_primary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(12),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.regularFont,
    },
    text_12_reg_darkgrey: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(14),
      color: colorSet[scheme].darkGrey,
      fontFamily: fontFamily.regularFont,
    },
    text_12_reg_dark2: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark2,
      fontFamily: fontFamily.regularFont,
    },

    text_12_reg_dark3: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark3,
      fontFamily: fontFamily.regularFont,
    },

    text_12_reg_dark3_: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark3,
      fontFamily: fontFamily.secondaryFont,
    },
    text_12_reg_light3: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].light3,
      fontFamily: fontFamily.regularFont,
    },
    text_12_regular_dark: {
      lineHeight: fontPixel(16),
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark,
      fontFamily: fontFamily.regularFont,
    },

    text_12_semi_dark3: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_12_semi_dark4: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark4,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_12_semi_dark2: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_12_semi_mainTextColor2: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_12_semi_mainTextColor3: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.secondaryFont,
    },
    text_12_semi_mainTextColor3: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_12_semi_static_white: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].static_white,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_12_semi_dark1: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].dark1,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_12_semi_light3: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].light3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_12_semi_primaryColor: {
      fontSize: fontPixel(12),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.semiBoldFont,
    },

    text_14_reg_dark1: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark1,
      fontFamily: fontFamily.regularFont,
    },
    text_14_reg_dark6: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark6,
      fontFamily: fontFamily.regularFont,
    },
    text_14_bold_primaryColor: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_green: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].green,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_mainTextColor3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_static_white: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].static_white,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_invert1: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].invert1,
      fontFamily: fontFamily.boldFont,
    },
    text_16_bold_invert1: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].invert1,
      fontFamily: fontFamily.boldFont,
    },
    text_16_bold_dark8: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].dark8,
      fontFamily: fontFamily.boldFont,
    },
    text_14_secondaryFont_dark8: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark8,
      fontFamily: fontFamily.secondaryFont,
    },
    text_16_secondaryFont_dark8: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].dark8,
      fontFamily: fontFamily.secondaryFont,
    },

    text_14_bold_invert2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].invert2,
      fontFamily: fontFamily.boldFont,
    },
    text_40_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(40),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },
    text_14_semi_white: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].white,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_reg_dark2: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark2,
      fontFamily: fontFamily.regularFont,
    },
    text_14_bold_dark2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark2,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_black: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].black,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_EarningMsgColor: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].EarningMsgColor,
      fontFamily: fontFamily.boldFont,
    },
    text_14_semi_primary: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_semi_primary_dark1: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark1,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_bold_primary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_green: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].green,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_red0: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].red0,
      fontFamily: fontFamily.boldFont,
    },
    text_14_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(14),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },
    text_10_semi_urgent: {
      fontSize: fontPixel(10),
      color: colorSet[scheme].urgent,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_10_semi_green4: {
      fontSize: fontPixel(10),
      color: colorSet[scheme].green4,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_10_semi_mainTextColor2: {
      fontSize: fontPixel(10),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_8_semi_mainTextColor2: {
      fontSize: fontPixel(8),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_8_semi_mainTextColor3: {
      fontSize: fontPixel(8),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_10_semi_dark4: {
      fontSize: fontPixel(10),
      color: colorSet[scheme].dark4,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_10_reg_primary: {
      lineHeight: fontPixel(14),
      fontSize: fontPixel(10),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.regularFont,
    },
    text_10_reg_mainTextColor2: {
      lineHeight: fontPixel(14),
      fontSize: fontPixel(10),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.regularFont,
    },
    text_10_reg_invert2: {
      lineHeight: fontPixel(14),
      fontSize: fontPixel(10),
      color: colorSet[scheme].invert2,
      fontFamily: fontFamily.regularFont,
    },

    text_10_reg_mainTextColor2_secondaryFont: {
      lineHeight: fontPixel(14),
      fontSize: fontPixel(10),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.secondaryFont,
    },
    text_10_reg_primary_secondaryFont: {
      lineHeight: fontPixel(14),
      fontSize: fontPixel(10),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.secondaryFont,
    },
    text_12_reg_primary_secondaryFont: {
      lineHeight: fontPixel(14),
      fontSize: fontPixel(12),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.secondaryFont,
    },
    text_10_reg_mainTextColor3_secondaryFont: {
      lineHeight: fontPixel(14),
      fontSize: fontPixel(10),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.secondaryFont,
    },
    text_10_bold_red1: {
      letterSpacing: 0.5,
      fontSize: fontPixel(10),
      color: colorSet[scheme].red1,
      fontFamily: fontFamily.boldFont,
    },
    text_10_semi_mainTextColor3: {
      fontSize: fontPixel(10),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_reg_darkgrey: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].darkGrey,
      fontFamily: fontFamily.regularFont,
    },

    text_14_reg_mainTextColor2: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.regularFont,
    },
    text_14_reg_white: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].white,
      fontFamily: fontFamily.regularFont,
    },

    text_14_reg_white_secondaryFont: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].white,
      fontFamily: fontFamily.secondaryFont,
    },
    text_14_reg_secondTextColor2: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].secondTextColor2,
      fontFamily: fontFamily.regularFont,
    },


    text_14_reg_primary: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.regularFont,
    },
    text_14_reg_secondaryFont_primary: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.regularFont,
    },
    text_14_reg_mainTextColor3: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.regularFont,
    },
    text_14_reg_secondaryFont: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.secondaryFont,
    },
    text_16_reg_secondaryFont: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(16),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.secondaryFont,
    },
    text_16_reg_secondaryFont_mainTextColor2: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(16),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.secondaryFont,
    },
    text_14_reg_dark3: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark3,
      fontFamily: fontFamily.regularFont,
    },
    text_14_reg_dark4: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark4,
      fontFamily: fontFamily.regularFont,
    },
    text_14_reg_green6: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].green6,
      fontFamily: fontFamily.regularFont,
    },
    text_14_semi_darkgrey: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].darkGrey,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_semi_urgent: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].urgent,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_semi_dark4: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark4,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_semi_dark2: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_semi_dark3: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].dark3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_semi_mainTextColor2: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_semi_white: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].white,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_semi_mainTextColor3: {
      fontSize: fontPixel(14),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_16_semi_primary: {
      fontSize: fontPixel(16),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.semiBoldFont,
    },

    text_16_reg_darkgrey: {
      lineHeight: fontPixel(22),
      fontSize: fontPixel(16),
      color: colorSet[scheme].darkGrey,
      fontFamily: fontFamily.regularFont,
    },
    text_16_reg_primary: {
      lineHeight: fontPixel(22),
      fontSize: fontPixel(16),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.regularFont,
    },
    text_16_bold_primary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.boldFont,
    },
    text_16_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },
    text_16_reg_dark1: {
      lineHeight: fontPixel(22),
      fontSize: fontPixel(16),
      color: colorSet[scheme].dark1,
      lineHeight: 22,
      fontFamily: fontFamily.regularFont,
    },
    text_16_reg_dark3: {
      lineHeight: fontPixel(22),
      fontSize: fontPixel(16),
      color: colorSet[scheme].dark3,
      lineHeight: 22,
      fontFamily: fontFamily.regularFont,
    },
    text_16_reg_mainTextColor2: {
      lineHeight: fontPixel(22),
      fontSize: fontPixel(16),
      color: colorSet[scheme].mainTextColor2,
      lineHeight: 22,
      fontFamily: fontFamily.regularFont,
    },
    text_16_reg_dark4: {
      lineHeight: fontPixel(22),
      fontSize: fontPixel(16),
      color: colorSet[scheme].dark4,
      lineHeight: 22,
      fontFamily: fontFamily.regularFont,
    },
    text_16_bold_mainTextColor3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.boldFont,
    },

    text_16_semi_mainTextColor2: {
      fontSize: fontPixel(16),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_16_semi_responseColor: {
      fontSize: fontPixel(16),
      color: colorSet[scheme].responseColor,
      fontFamily: fontFamily.semiBoldFont,
    },

    text_16_semi_dark4: {
      fontSize: fontPixel(16),
      color: colorSet[scheme].dark4,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_16_bold_green: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].green,
      fontFamily: fontFamily.boldFont,
    },
    text_16_bold_EarningMsgColor: {
      letterSpacing: 0.5,
      fontSize: fontPixel(16),
      color: colorSet[scheme].EarningMsgColor,
      fontFamily: fontFamily.boldFont,
    },
    text_36_bold_green: {
      letterSpacing: 0.5,
      fontSize: fontPixel(36),
      color: colorSet[scheme].green,
      fontFamily: fontFamily.boldFont,
    },
    text_36_bold_red1: {
      letterSpacing: 0.5,
      fontSize: fontPixel(36),
      color: colorSet[scheme].red1,
      fontFamily: fontFamily.boldFont,
    },
    text_18_bold_green: {
      letterSpacing: 0.5,
      fontSize: fontPixel(18),
      color: colorSet[scheme].green,
      fontFamily: fontFamily.boldFont,
    },
    text_18_bold_red0: {
      letterSpacing: 0.5,
      fontSize: fontPixel(18),
      color: colorSet[scheme].red0,
      fontFamily: fontFamily.boldFont,
    },
    text_18_bold_white: {
      letterSpacing: 0.5,
      fontSize: fontPixel(18),
      color: colorSet[scheme].white,
      fontFamily: fontFamily.boldFont,
    },
    text_18_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(18),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },

    text_18_reg_darkgrey: {
      lineHeight: fontPixel(24),
      fontSize: fontPixel(18),
      color: colorSet[scheme].darkGrey,
      fontFamily: fontFamily.regularFont,
    },

    text_18_reg_primary: {
      lineHeight: fontPixel(24),
      fontSize: fontPixel(18),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.regularFont,
    },

    text_18_reg_dark4: {
      lineHeight: fontPixel(24),
      fontSize: fontPixel(18),
      color: colorSet[scheme].dark4,
      fontFamily: fontFamily.regularFont,
    },

    text_18_reg_mainTextColor2: {
      lineHeight: fontPixel(24),
      fontSize: fontPixel(18),
      color: colorSet[scheme].dark4,
      fontFamily: fontFamily.mainTextColor2,
    },

    text_18_semi_mainTextColor2: {
      fontSize: fontPixel(18),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_18_bold_primary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(18),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.boldFont,
    },

    text_20_semi_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(20),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },

    text_24_bold_mainTextColor3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.boldFont,
    },
    text_24_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },
    text_24_semi_mainTextColor: {
      fontSize: fontPixel(24),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_24_reg_mainTextColor2: {
      fontSize: fontPixel(24),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.regularFont,
    },
    text_24_semi_static_white: {
      fontSize: fontPixel(24),
      color: colorSet[scheme].static_white,
      fontFamily: fontFamily.semiBoldFont,
    },

    text_24_semi_mainTextColor3: {
      fontSize: fontPixel(24),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_24_semi_mainTextColor2: {
      fontSize: fontPixel(24),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_14_reg_static_white: {
      lineHeight: fontPixel(20),
      fontSize: fontPixel(14),
      color: colorSet[scheme].static_white,
      fontFamily: fontFamily.regularFont,
    },

    text_24_bold_EarningMsgColor: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].EarningMsgColor,
      fontFamily: fontFamily.boldFont,
    },
    text_36_semi_mainTextColor3: {
      fontSize: fontPixel(36),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.semiBoldFont,
    },
    text_36_semi_static_white: {
      fontSize: fontPixel(36),
      color: colorSet[scheme].static_white,
      fontFamily: fontFamily.semiBoldFont,
    },

    text_36_reg_mainTextColor3: {
      fontSize: fontPixel(36),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.regularFont,
    },
    text_24_bold_primary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.boldFont,
    },
    text_24_bold_red4: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].red4,
      fontFamily: fontFamily.boldFont,
    },
    text_32_bold_primary_secondary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(32),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.secondaryFont,
    },
    text_32_bold_mainTextColor2_secondary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(32),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.secondaryFont,
    },
    text_32_bold_primary: {
      letterSpacing: 0.5,
      fontSize: fontPixel(32),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.secondaryFont,
    },
    text_24_bold_green3: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].green3,
      fontFamily: fontFamily.boldFont,
    },
    text_24_bold_blue5: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].blue5,
      fontFamily: fontFamily.boldFont,
    },

    text_24_bold_mainTextColor2: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.boldFont,
    },
    text_24_bold_white: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].white,
      fontFamily: fontFamily.boldFont,
    },
    text_24_bold_green: {
      letterSpacing: 0.5,
      fontSize: fontPixel(24),
      color: colorSet[scheme].green,
      fontFamily: fontFamily.boldFont,
    },
    text_28_bold_mainThemeForegroundColor: {
      letterSpacing: 0.5,
      fontSize: fontPixel(28),
      color: colorSet[scheme].mainThemeForegroundColor,
      fontFamily: fontFamily.boldFont,
    },


    background16Padding: {
      // borderRadius: widthPixel(16),
      paddingVertical: heightPixel(16),
      paddingHorizontal: widthPixel(16),
      borderWidth: 0.5,
      width: '100%',
      elevation: 5,
      borderColor: colorSet[scheme].light1,
      backgroundColor: colorSet[scheme].mainThemeBackgroundColor
    },
    tabBarStyle: {
      height: 60,
      borderRadius: 20,
      marginHorizontal: widthPixel(8),
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 10,
      position: 'absolute',
      overflow: 'hidden',
      borderTopWidth: 0,
      elevation: 0,
      marginBottom: heightPixel(16),

    },
    bottomBtn: {
      position: 'absolute',
      bottom: heightPixel(24),
    },
    bottomStickyView: {
      flex: 1,
      backgroundColor: colorSet[scheme].mainThemeBackgroundColor,
      justifyContent: 'flex-end',
    },
    whiteBackgroundContainer: {
      backgroundColor: colorSet[scheme].mainThemeBackgroundColor,
      // position: 'absolute', 
      width: '100%', alignSelf: 'center',
      bottom: widthPixel(48),
      justifyContent: 'flex-end'
    },
    logoImageStyle: { height: heightPixel(32), width: widthPixel(100) },
    logoImageContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: heightPixel(16) },
    text_20_reg_primary: {
      fontSize: fontPixel(20),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.regularFont,
    },
    text_20_secondaryFont_mainTextColor2: {
      fontSize: fontPixel(20),
      color: colorSet[scheme].mainTextColor2,
      fontFamily: fontFamily.secondaryFont,
    },

    text_24_secondaryFont: {
      fontSize: fontPixel(24),
      color: colorSet[scheme].primaryColor,
      fontFamily: fontFamily.secondaryFont,
    },

    text_20_reg_white_secondaryFont: {
      fontSize: fontPixel(20),
      color: colorSet[scheme].white,
      fontFamily: fontFamily.secondaryFont,
    },
    text_36_reg_white_secondaryFont: {
      fontSize: fontPixel(36),
      color: colorSet[scheme].white,
      fontFamily: fontFamily.secondaryFont,
    },
    text_16_semi_mainTextColor3: {
      fontSize: fontPixel(16),
      color: colorSet[scheme].mainTextColor3,
      fontFamily: fontFamily.semiBoldFont,
    }
  });
};

export default {
  colorSet,
  fontFamily,
  getAllStyles, getToolbarStyle
};
