import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import { useDispatch, useSelector } from 'react-redux';
import Toolbar from '../../components/ui/Toolbar';
import { DEVICE_WIDTH } from '../../utils/Helper';
import FastImage from '@d11/react-native-fast-image';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { SearchIcon, ArrowRight } from 'lucide-react-native';
import { fetchCollections } from '../../redux/reducers/collectionSlice';

// This screen is redesigned to show a searchable grid of Collections

const LevelOne = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colorScheme } = useSelector(state => state.app);
  const styles = AppStyles.getAllStyles(colorScheme);
  const collections = useSelector(state => state?.collections?.collections) || [];
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!collections || collections.length === 0) {
      dispatch(fetchCollections(200));
    }
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (!query) return collections;
    const q = query.toLowerCase();
    return collections.filter(c => c?.title?.toLowerCase().includes(q));
  }, [collections, query]);

  return (
    <>
      <Toolbar title={'Category'} />
      <ScrollView style={localStyles.container} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={localStyles.searchBar}>
          <SearchIcon size={20} color={'#F2994A'} />
          <TextInput
            placeholder="Find perfect spare part..."
            placeholderTextColor={'#8E8E8E'}
            value={query}
            onChangeText={setQuery}
            style={localStyles.searchInput}
          />
        </View>

        {/* Grid */}
        <View style={localStyles.gridWrapper}>
          {filtered.map((item, idx) => (
            <TouchableOpacity
              key={item?.id || idx}
              style={localStyles.card}
              onPress={() => navigation.navigate('ProductList', { handle: item?.handle, title: item?.title })}
            >
              <View style={localStyles.imageBox}>
                <FastImage
                  source={item?.image?.url ? { uri: item.image.url } : require('../../../assets/images/img.png')}
                  style={localStyles.image}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={localStyles.cardFooter}>
                <Text numberOfLines={1} style={localStyles.cardTitle}>{item?.title}</Text>
                <ArrowRight size={18} color={'#F2994A'} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: heightPixel(90) }} />
      </ScrollView>


    </>
  );
};

export default LevelOne;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D1A44',
    paddingHorizontal: widthPixel(16),
    paddingTop: heightPixel(12),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: widthPixel(24),
    height: heightPixel(44),
    paddingHorizontal: widthPixel(14),
    marginBottom: heightPixel(12)
  },
  searchInput: {
    flex: 1,
    marginLeft: widthPixel(8),
    color: '#1F2024'
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: heightPixel(14),
    paddingBottom: heightPixel(16),
  },
  card: {
    width: (DEVICE_WIDTH - widthPixel(16) * 2 - widthPixel(12)) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: widthPixel(16),
    padding: widthPixel(12),
  },
  imageBox: {
    width: '100%',
    height: heightPixel(160),
    borderRadius: widthPixel(12),
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    marginTop: heightPixel(8),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#1F2024',
    fontWeight: '700',
    fontSize: heightPixel(16),
    // flex: 1,
    marginRight: widthPixel(5)
  }
});


