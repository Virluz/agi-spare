import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Video from 'react-native-video';
import { DEVICE_HEIGHT } from '../../utils/Helper';

const VideoScreen = () => {
    return (
        <Video
            source={require('../../../assets/videos/AirDryreel_changes.mp4')}
            style={{ width: '100%', height: DEVICE_HEIGHT - 108 }}
            resizeMode='cover'
            controls={false}
            repeat
        // fullscreen={false}
        />
    )
}

export default VideoScreen

const styles = StyleSheet.create({})