import { NativeModules, Platform } from 'react-native';

const NativeShield = NativeModules.DeviceShield;

const Shield = {
    isRooted: async () => {
        try {
            const rooted = await NativeShield.isRooted();
            if (rooted) {
                if (Platform.OS === 'ios') {
                    console.warn('🚨 Device is jailbroken (iOS)');
                } else if (Platform.OS === 'android') {
                    console.warn('🚨 Device is rooted (Android)');
                }
            } else {
                console.log('✅ Device is secure');
            }

            return rooted;
        } catch (error) {
            console.warn('❌ Root/Jailbreak check failed:', error);
            return false;
        }
    },

    enableScreenShield: () => {
        try {
            if (Platform.OS === 'ios' && NativeShield?.enableScreenShield) {
                NativeShield.enableScreenShield();
            }
        } catch (err) {
            console.error('Error enabling screen shield:', err);
        }
    }
};

export default Shield;
