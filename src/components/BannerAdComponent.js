import { AdUnits } from '@/src/constants/adUnits';
import { Text, View } from 'react-native';

// Only import admob in production build
const IS_DEV = __DEV__;

export default function BannerAdComponent() {
    if (IS_DEV) {
        // Return fake banner during development
        return (
            <View style={{
                height: 50,
                backgroundColor: '#1A1A1A',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
            }}>
                <Text style={{ color: '#555' }}>[ Ad Placeholder ]</Text>
            </View>
        );
    }

    // Real ad in production
    try {
        const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');
        return (
            <BannerAd
                unitId={AdUnits.banner || TestIds.BANNER}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
        );
    } catch (e) {
        console.warn('AdMob not available', e);
        return null;
    }
}
