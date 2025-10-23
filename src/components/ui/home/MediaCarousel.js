import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    TouchableWithoutFeedback,
    Text,
    ActivityIndicator
} from 'react-native';
import Video from 'react-native-video';
import { heightPixel, widthPixel } from '../../../utils/fonts';
import { useSelector } from 'react-redux';
import AppStyles from '../../../styles/AppStyles';
import { PrimaryButton } from '../PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { _getVerticalPadding } from '../../../utils/Helper';

const videos = [
    // {
    //     id: '1',
    //     type: 'video',
    //     source: { uri: 'https://styleunion.in/cdn/shop/videos/c/vp/2c31a1fa2e6e4259ad50596e7c5edf89/2c31a1fa2e6e4259ad50596e7c5edf89.HD-1080p-7.2Mbps-54793300.mp4?v=0' },
    //     handle: 'air-dry-collection',
    //     title: 'AirDry- shirt',
    //     desc: 'fit for office and casual wear',
    //     buttonText: 'shop Now'
    // },
    // {
    //     id: '2',
    //     type: 'video',
    //     source: { uri: 'https://styleunion.in/cdn/shop/videos/c/vp/d0bc58b449ae4c5b8f011130728ccc90/d0bc58b449ae4c5b8f011130728ccc90.HD-1080p-7.2Mbps-54745692.mp4?v=0' },
    //     handle: 'air-dry-collection',
    //     title: 'AirDry- shirt',
    //     desc: 'fit for office and casual wear',
    //     buttonText: 'shop Now'
    // },
    {
        id: '3',
        type: 'video',
        source: { uri: 'https://styleunion.in/cdn/shop/videos/c/vp/20625532078a49de850525934a61c80f/20625532078a49de850525934a61c80f.HD-1080p-7.2Mbps-54745796.mp4?v=0' },
        handle: 'summer-collection',
        title: 'Summer Collection',
        desc: 'fit for office and casual wear',
        buttonText: 'shop Now'

    },
    {
        id: '4',
        type: 'video',
        source: { uri: 'https://styleunion.in/cdn/shop/videos/c/vp/824a4189bd854f628eac692eb6152df8/824a4189bd854f628eac692eb6152df8.HD-720p-4.5Mbps-54745782.mp4?v=0' },
        handle: 'summer-collection',
        title: 'Summer Collection',
        desc: 'fit for office and casual wear',
        buttonText: 'shop Now'
    },
    {
        id: '5',
        type: 'video',
        source: { uri: 'https://styleunion.in/cdn/shop/videos/c/vp/ee8cbd1d4e874cd1b3b94e7782e457a1/ee8cbd1d4e874cd1b3b94e7782e457a1.HD-1080p-7.2Mbps-54745773.mp4?v=0' },
        handle: 'party-wear-dress',
        title: 'Party Wear Collection',
        desc: 'fit for office and casual wear',
        buttonText: 'shop Now'
    },
];

const height = Dimensions.get('window').height - heightPixel(135)


const MediaCarousel = ({ outerScrollRef, activeVideoIndex, setActiveVideoIndex }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isBuffering, setIsBuffering] = useState({});
    const videoRefs = useRef({});

    const { colorScheme, } = useSelector(state => state.app);
    const navigation = useNavigation();

    const appStyles = AppStyles.getAllStyles(colorScheme);
    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const handleBuffer = (index, isBuffering) => {
        setIsBuffering(prev => ({ ...prev, [index]: isBuffering }));
    };

    const renderVideoItem = useCallback((item, index) => (
        <View key={item.id} style={styles.videoContainer}>
            <Video
                ref={(ref) => {
                    videoRefs.current[index] = ref;
                }}
                source={item.source}
                style={styles.video}
                resizeMode="cover"
                paused={index !== activeVideoIndex}
                repeat={true}
                controls={false}
                muted={true}
                bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000
                }}
                onBuffer={(data) => handleBuffer(index, data.isBuffering)}
                onError={(error) => {
                    console.error('Video error:', error);
                }}
                onLoad={() => {
                    console.log('Video loaded:', index);
                }}
            />

            {isBuffering[index] && (
                <View style={styles.bufferingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}

            {/* <TouchableWithoutFeedback onPress={toggleMute}>
                <View style={styles.controlsOverlay}>
                    <View style={styles.controlBar}>
                        <Text style={styles.controlText}>
                            {isMuted ? '🔇 Muted' : '🔊 Sound on'}
                        </Text>
                        <Text style={styles.controlText}>
                            Video {parseInt(index) + 1} of {videos.length}
                        </Text>
                    </View>
                </View>
            </TouchableWithoutFeedback> */}

            <View style={{
                position: 'absolute', width: widthPixel(150),
                left: 20, bottom: 80,
            }}>

                <Text style={appStyles.text_20_reg_white_secondaryFont}>

                    {item.title}

                </Text>

                <Text style={appStyles.text_14_reg_white}>

                    {item.desc}

                </Text>

                {_getVerticalPadding(16)}

                <PrimaryButton title={item.buttonText} showNextArrows onPress={() => navigation.navigate('ProductList', { handle: item?.handle, title: item?.title })} />


            </View>

            <View style={{ position: 'absolute', top: height / 2, right: 20, zindex: 10 }}>

                {videos.map((v, idx) => (
                    <View
                        key={v.id || idx}
                        style={{
                            width: 8,
                            height: idx === activeVideoIndex ? 48 : 16,
                            borderRadius: 4,
                            backgroundColor: idx === activeVideoIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                            marginVertical: 4,
                        }}
                    />
                ))}
            </View>
        </View>
    ), [activeVideoIndex, isMuted, isBuffering]);

    return (
        <>
            <View style={styles.container}>
                {videos.map((item, index) => renderVideoItem(item, index))}


            </View>


        </>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        height: height,
        width: '100%',
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    controlBar: {
        width: '100%',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    controlText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bufferingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
});

export default MediaCarousel;