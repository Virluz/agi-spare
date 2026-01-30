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