import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import { _getVerticalPadding, ITEM_SPACING, SIDE_MARGIN } from '../../utils/Helper';
import SectionName from '../../components/ui/home/SectionName';
import ProductCard from '../../components/ui/ProductCard';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { getCollectionByHandle } from '../../graphql/graph_request';
import { useTranslation } from 'react-i18next';
import { showErrorMsg } from '../../widgets/FlashMessages';
import Constants from '../../utils/Constants';

const BestSeller = () => {
  const { colorScheme } = useSelector(state => state.app);
  const appStyles = AppStyles.getAllStyles(colorScheme);
  const colorSet = AppStyles.colorSet[colorScheme];
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getCollectionByHandle({ handle: 'best-seller', first: 4 });
        setItems(res?.collection?.products?.edges || []);
      } catch (e) {
        showErrorMsg(Constants.DEFAULT_ERROR);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={appStyles.container_no_padding}>
      {_getVerticalPadding(30)}
      <View style={{ alignItems: 'center' }}>
        <SectionName title={t('BEST SELLERS')} />
        {_getVerticalPadding(10)}
        <FlatList
          data={items}
          renderItem={({ item, index }) => (
            <ProductCard item={item} index={index} />
          )}
          keyExtractor={(item, index) => item?.node?.id?.toString?.() || String(index)}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SIDE_MARGIN,
            paddingTop: ITEM_SPACING,
            paddingBottom: ITEM_SPACING,
            flexGrow: 1,
            backgroundColor: colorSet?.mainThemeBackgroundColor,
          }}
          ListFooterComponent={
            <PrimaryButton
              title={'View All'}
              showNextArrows
              onPress={() => navigation.navigate('ProductList', { handle: 'best-seller', title: 'Best Sellers' })}
            />
          }
          scrollEnabled={false}
        />
      </View>
      {_getVerticalPadding(30)}
    </View>
  );
};

export default BestSeller;

const localStyles = StyleSheet.create({});