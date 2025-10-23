import React, { useEffect } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCollections } from '../../redux/reducers/collectionSlice';

const Collections = () => {
    const dispatch = useDispatch();
    const collections = useSelector(state => state?.collections?.collections);

    console.log("collections", collections);

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const result = dispatch(fetchCollections(50));
                // console.log('Query result:', result); // Debug the response
            } catch (err) {
                console.error('Collection fetch error:', err);
            }
        };
        loadCollections();
    }, [dispatch]);


    return (
        <View style={{ flex: 1, }}>

            <FlatList
                data={collections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    console.log("item", item);

                    return (
                        <View style={{ margin: 10, }}>
                            <Image
                                source={{ uri: item.image?.url }}
                                style={{ width: '100%', height: 200 }}
                                resizeMode="cover" />
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
                            <Text>{item.description}</Text>

                            <FlatList
                                horizontal
                                data={item?.products?.edges}
                                keyExtractor={(product) => product.node.id}
                                renderItem={({ item: product }) => (
                                    <View style={{ margin: 5 }}>
                                        <Image
                                            source={{ uri: product.node.featuredImage?.url }}
                                            style={{ width: 100, height: 100 }} />
                                        <Text>{product.node.title}</Text>
                                    </View>
                                )} />
                        </View>
                    );
                }}
            />

        </View>

    );
};

export default Collections;