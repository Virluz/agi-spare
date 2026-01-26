import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, Pressable } from 'react-native';
import { useController } from 'react-hook-form';
import {
  PASSWORD_REGX,
  _getValidateText,
  _getVerticalPadding,
  colors,
  getAccessbility,
} from '../../utils/Helper';
import fonts, { fontPixel, heightPixel, widthPixel } from '../../utils/fonts';
import Ripple from 'react-native-material-ripple';
import Constants from '../../utils/Constants';
import AppStyles from '../../styles/AppStyles';
import { IMLocalized } from '../../service/i18n.config';
import { useSelector } from 'react-redux';

const CommonInput = props => {
  const {
    control,
    name,
    rules,
    placeholder,
    keyboardType,
    title,
    errors,
    starMark = false,
    errorMessage = null,
    inputProps,
    checklist,
    capital,
    style,
    onChange = () => { },
    Icon, isCountrySelect = false,
    iconName,
    onIconPress, maxLength = 0
  } = props;

  const { field } = useController({
    control: control,
    name: name,
    rules: rules,
  });

  const translateKeys = {
    This_field_is_Required: IMLocalized('This field is Required'),
  }

  const [focus, setOnFocus] = useState(false);
  const { colorScheme } = useSelector(state => state.app);

  const appstyles = AppStyles.getAllStyles(colorScheme);

  const colors = AppStyles.colorSet[colorScheme];
  const styles = getStyles(colors);
  const accessbility = getAccessbility(
    title,
    Constants.ACESSBILITY_LABEL.TEXTINPUT,
  );
  const accessbilityButton = getAccessbility(
    title,
    Constants.ACESSBILITY_LABEL.BUTTON,
  );

  const handleOnChange = val => {
    field.onChange(val);
    onChange(val);
  };




  return (
    <View style={[style]}>
      {title &&
        <Text style={[appstyles.text_12_reg_mainTextColor2]}>
          {title}
          {rules['required'] === true && starMark && '*'}
        </Text>
      }

      <View style={styles.inputBox}>
        {isCountrySelect &&
          <>
            {isCountrySelect}
          </>
        }
        <TextInput
          accessibilityLabel={accessbility.label}
          style={[appstyles.text_14_reg_mainTextColor2, { width: "100%" }]}
          onChangeText={text => {
            handleOnChange(text);
          }}

          placeholder={placeholder}
          onFocus={() => setOnFocus(true)}
          onBlur={() => setOnFocus(false)}
          placeholderTextColor={AppStyles.colorSet[colorScheme].dark7}
          value={field.value}
          keyboardType={keyboardType}
          {...inputProps}
          autoCapitalize={capital ? 'words' : 'none'}
          contextMenuHidden={true}

          {...maxLength > 0 && { maxLength: maxLength }}
        />

      </View>

      {errors[name]?.type === 'required' &&
        _getValidateText(translateKeys.This_field_is_Required)}

      {errors[name]?.type === 'pattern' &&
        _getValidateText(errorMessage ? errorMessage : 'Enter valid ' + title)}

    </View>
  );
};


const getStyles = colors => {
  return StyleSheet.create({
    textInput: {
      width: '90%',
      fontSize: fonts._14,
      height: heightPixel(40),
      textAlignVertical: 'center',
      color: colors.mainTextColor2,
      flexShrink: 1
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: heightPixel(42),
      borderWidth: widthPixel(1),
      // borderRadius: heightPixel(12),
      borderColor: '#DEDEDE',
      borderStyle: 'solid',
      marginVertical: heightPixel(8),
      paddingHorizontal: widthPixel(8)

    },
    iconRipple: {
      width: widthPixel(30),
      justifyContent: 'center',
      alignItems: 'center',
      height: heightPixel(40),
    }
  });
};


export default CommonInput;
