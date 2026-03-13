import { AdUnits } from '@/src/constants/adUnits';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
    isPremium?: boolean;
}

export default function BannerAdComponent({ isPremium = false }: Props) {
    const [adLoaded, setAdLoaded] = useState(false);

    if (isPremium) return null;

    if (__DEV__) {
        return (
            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>[ Ad Banner ]</Text>
            </View>
        );
    }

    try {
        const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');
        return (
            <View style={[styles.container, !adLoaded && styles.hidden]}>
                <BannerAd
                    unitId={AdUnits.banner}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                    onAdLoaded={() => setAdLoaded(true)}
                    onAdFailedToLoad={() => setAdLoaded(false)}
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
    placeholderText: { color: '#555', fontSize: 12 },
    container: { alignItems: 'center', width: '100%' },
    hidden: { height: 0, overflow: 'hidden' },
});
