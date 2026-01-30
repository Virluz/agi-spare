import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    BackHandler,
} from 'react-native';
import AppVersionCheckService from '../service/AppVersionCheck';
import ForceUpdateConfig from '../config/ForceUpdateConfig';

interface ForceUpdateModalProps {
    visible: boolean;
    currentVersion: string;
    latestVersion: string;
    storeUrl: string;
    message?: string;
    onUpdate: () => void;
}

const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
    visible,
    currentVersion,
    latestVersion,
    storeUrl,
    message,
    onUpdate,
}) => {
    // Disable back button when modal is visible
    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (visible) {
                    return true; // Prevent back button
                }
                return false;
            }
        );

        return () => backHandler.remove();
    }, [visible]);

    const handleUpdate = () => {
        AppVersionCheckService.openStore(storeUrl);
        if (onUpdate) {
            onUpdate();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType={ForceUpdateConfig.MODAL.ANIMATION_TYPE as any}
            statusBarTranslucent={true}
            hardwareAccelerated={true}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconText}>📲</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Update Required</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        {message || ForceUpdateConfig.MODAL.DEFAULT_MESSAGE}
                    </Text>

                    {/* Version Info */}
                    <View style={styles.versionContainer}>
                        <View style={styles.versionRow}>
                            <Text style={styles.versionLabel}>Current Version:</Text>
                            <Text style={styles.versionValue}>{currentVersion}</Text>
                        </View>
                        <View style={styles.versionRow}>
                            <Text style={styles.versionLabel}>Latest Version:</Text>
                            <Text style={styles.versionValueLatest}>{latestVersion}</Text>
                        </View>
                    </View>

                    {/* Update Button */}
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdate}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.updateButtonText}>
                            {ForceUpdateConfig.MODAL.UPDATE_BUTTON_TEXT}
                        </Text>
                    </TouchableOpacity>

                    {/* Store Badge */}
                    <Text style={styles.storeText}>
                        {Platform.OS === 'ios'
                            ? ForceUpdateConfig.MODAL.IOS_STORE_TEXT
                            : ForceUpdateConfig.MODAL.ANDROID_STORE_TEXT}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    versionContainer: {
        width: '100%',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    versionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    versionLabel: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    versionValue: {
        fontSize: 14,
        color: '#999999',
        fontWeight: '600',
    },
    versionValueLatest: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '700',
    },
    updateButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    storeText: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
    },
});

export default ForceUpdateModal;
