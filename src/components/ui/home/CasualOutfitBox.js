import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { widthPixel, heightPixel } from '../../../utils/fonts';

const CasualOutfitBox = ({ style }) => {
  return (
    <View style={[localStyles.container, style]}>
      <Text style={localStyles.text}>Casual Outfit</Text>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(15),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(217, 237, 217, 0.8)', // Semi-transparent light green background for the text box
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50', // Darker green text color
  },
});

export default CasualOutfitBox;