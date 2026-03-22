import { AdUnits } from '@/src/constants/adUnits';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Only import admob in production build
const IS_DEV = __DEV__;

export default function BannerAdComponent({ isPremium, useWrapper = false }) {
    const insets = useSafeAreaInsets();
    if (isPremium) return null;
    
    const wrapperStyle = useWrapper ? {
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 10,
        backgroundColor: '#f8f9fa', // Default light background for wrapper
        borderTopWidth: 0.5,
        borderTopColor: '#dee2e6'
    } : {};

    if (IS_DEV) {
        // Return fake banner during development
        return (
            <View style={[
                {
                    height: 50,
                    backgroundColor: '#1A1A1A',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                },
                wrapperStyle
            ]}>
                <Text style={{ color: '#555' }}>[ Ad Placeholder ]</Text>
            </View>
        );
    }

    // Real ad in production
    try {
        const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');
        return (
            <View style={[{ alignItems: 'center', justifyContent: 'center', width: '100%' }, wrapperStyle]}>
                <BannerAd
                    unitId={AdUnits.banner || TestIds.BANNER}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                />
            </View>
        );
    } catch (e) {
        console.warn('AdMob not available', e);
        return null;
    }
}
