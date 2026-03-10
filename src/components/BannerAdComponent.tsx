import { AdUnits } from '@/src/constants/adUnits';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BannerAdComponentProps {
    isPremium?: boolean;
}

export default function BannerAdComponent({
    isPremium = false
}: BannerAdComponentProps) {

    // Premium users — return nothing, no empty space
    if (isPremium) return null;

    // Development mode — show placeholder
    if (__DEV__) {
        return (
            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>[ Ad Placeholder ]</Text>
            </View>
        );
    }

    // Production — show real AdMob banner
    try {
        const {
            BannerAd,
            BannerAdSize,
        } = require('react-native-google-mobile-ads');

        return (
            <View style={styles.bannerContainer}>
                <BannerAd
                    unitId={AdUnits.banner}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                    onAdFailedToLoad={(error: any) => {
                        console.warn('Banner ad failed to load:', error);
                    }}
                />
            </View>
        );
    } catch (e) {
        return null;
    }
}

const styles = StyleSheet.create({
    placeholder: {
        height: 50,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    placeholderText: {
        color: '#555555',
        fontSize: 12,
    },
    bannerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 10,
    }
});
