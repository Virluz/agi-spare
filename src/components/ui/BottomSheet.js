import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Ripple from 'react-native-material-ripple';
import { _getHorizontalPadding, _getValidateText, _getVerticalPadding } from '../../utils/Helper';
import fonts, { heightPixel, widthPixel } from '../../utils/fonts';
import RBSheet from 'react-native-raw-bottom-sheet';
import { FlatList } from 'react-native-gesture-handler';
import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import { ChevronRight } from 'lucide-react-native';

export const BottomSheet = ({ title, placeholder, data, onSelect, header, selectorParam, control,
  name, defaultId,
  rules = { required: true }, errors, errorMessage, stylesFromParent = {}, titleStylesFromParent = {}, settingScreen = false }) => {
  const bottomSheetRef = useRef();
  const [selected, setSelected] = useState(null);
  const { colorScheme } = useSelector(state => state.app);
  const styles = AppStyles.getAllStyles(colorScheme);

  const colorSet = AppStyles.colorSet[colorScheme ?? 'light']
  const localStyles = getLocalStyles(colorSet);

  const { t } = useTranslation();


  const { field } = useController({
    control: control,
    name: name,
    rules: rules,
  });

  const translateKeys = {
    This_field_is_Required: t("This field is Required"),
    App_theme: t('App Theme'),

  }

  useEffect(() => {
    if (defaultId) {
      const selectedData = data.find((item) => item?.api_id === defaultId);
      setSelected(selectedData?.name);
      onSelect(selectedData?.api_id, true);
      field.onChange(selectedData?.api_id);
    }
  }, [data]);

  useEffect(() => {
    console.log("ERROR", errors);
  }, [errors])


  const renderItem = ({ item, index }) => (

    <Ripple
      onPress={() => {
        setSelected(item?.name);
        onSelect(item.api_id);
        field.onChange(item.api_id);
        bottomSheetRef.current.close();
      }}
      style={[localStyles.rowContainer, item.name === selected && localStyles.selectedStyle]}>

      <Text style={styles.text_16_semi_mainTextColor2}>

        {item?.name}

      </Text>

      {/* <RadioButtons selected={item.name === selected} /> */}

    </Ripple>
  );

  const getFooter = () => {
    return <></>;
  };

  const getHeader = () => {
    return (
      <View style={localStyles.headerContainer}>
        <Text style={styles.text_18_bold_mainTextColor2}>
          {header}
        </Text>
      </View>
    );
  };

  const getBottomSheet = () => {
    return (
      <RBSheet
        animationType="fade"
        ref={bottomSheetRef}
        height={
          data?.length <= 3 ? data.length * 150 : fonts._DEVICE_HEIGHT / 1.5
        }
        openDuration={300}
        customStyles={{
          container: localStyles.sheetContainer,
        }}>

        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListHeaderComponent={getHeader}
          ListFooterComponent={getFooter}
          ItemSeparatorComponent={_getVerticalPadding(8)}
        />

      </RBSheet>
    );
  };


  if (settingScreen) {
    return (
      <>
        <Ripple style={localStyles.listItemSubRow} onPress={() => bottomSheetRef.current.open()}>

          <View style={localStyles.rowTitleContainer}>

            {/* <View style={localStyles.listItemIcon}>

              <Colorfilter variant='Linear' size={widthPixel(20)} color={localStyles.iconColor} />

            </View> */}

            {_getHorizontalPadding(8)}

            <Text style={styles.text_14_semi_mainTextColor2}>{translateKeys.App_theme}</Text>

          </View>

          <ChevronRight color={colorSet.black} />


        </Ripple>

        {getBottomSheet()}

      </>

    )
  }

  return (
    <View style={localStyles.container}>
      {title &&
        <Text style={[styles.text_12_bold_mainTextColor2, titleStylesFromParent]}>{title}</Text>
      }



      <Ripple
        onPress={() => bottomSheetRef.current.open()}
        style={[styles.inputBox, localStyles.row, stylesFromParent]}>

        <Text style={selected ? styles.text_14_reg_mainTextColor2 : styles.text_14_semi_dark4}>

          {selected ? selected : placeholder}

        </Text>

        {/* <Image
          style={localStyles.downArrow}
          source={require('../assets/down.png')}
        /> */}
      </Ripple>

      {errors[name] && _getValidateText(errorMessage ?? translateKeys.This_field_is_Required)}

      {getBottomSheet()}

    </View>
  );
};

const getLocalStyles = (colorSet) => {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    container: {
      paddingVertical: heightPixel(5),
    },
    downArrow: { height: heightPixel(12), width: widthPixel(12) },
    sheetContainer: {
      borderTopRightRadius: widthPixel(20),
      borderTopLeftRadius: widthPixel(20),
      paddingHorizontal: widthPixel(15),
      backgroundColor: colorSet?.mainThemeBackgroundColor
    },
    headerContainer: {
      paddingVertical: heightPixel(20),
    },
    rowContainer: {
      padding: heightPixel(16),
      alignItems: 'center',
      borderRadius: heightPixel(12),
      borderWidth: 0.5,
      borderColor: colorSet?.light,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    selectedStyle: {
      borderColor: colorSet?.black,
      backgroundColor: colorSet?.light2
    },
    radioButton: {
      height: widthPixel(16),
      width: widthPixel(16),
      borderRadius: widthPixel(8),
      backgroundColor: colorSet?.black,
      alignItems: 'center',
      justifyContent: 'center'
    },
    radioButtonInside: {
      height: widthPixel(6),
      width: widthPixel(6),
      borderRadius: widthPixel(4),
      backgroundColor: colorSet?.mainThemeBackgroundColor
    },
    deselectedButton: {
      height: widthPixel(16),
      width: widthPixel(16),
      borderWidth: 1.5,
      borderRadius: widthPixel(8),
      borderColor: colorSet?.light
    },
    listItem: {
      backgroundColor: 'white',
      padding: widthPixel(16),
      marginTop: heightPixel(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colorSet?.mainThemeBackgroundColor,
    },
    listItemSubRow: {
      height: heightPixel(56), borderRadius: widthPixel(12),
      borderWidth: 0.5, borderColor: '#C5C6CC', alignItems: 'center',
      justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: widthPixel(16)
    },
    listItemIcon: {
      width: 24,
      alignItems: 'center',
    },
    rowTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconColor: colorSet?.dark,
    listItemIcon: {
      width: 24,
      alignItems: 'center',
    },

  });
}
