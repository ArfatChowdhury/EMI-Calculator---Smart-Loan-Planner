import { AdUnits } from '@/src/constants/adUnits';
import { Colors } from '@/constants/Colors';
import { useSettings } from '@/src/hooks/useSettings';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

interface Props {
    isPremium?: boolean;
    useWrapper?: boolean;
}

export default function BannerAdComponent({ isPremium = false, useWrapper = false }: Props) {
    const [adLoaded, setAdLoaded] = useState(false);
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];

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
            <View style={[
                useWrapper && {
                    backgroundColor: theme.card,
                    borderTopWidth: 0.5,
                    borderTopColor: theme.border,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    paddingTop: 10,
                },
                !adLoaded && styles.hidden
            ]}>
                <View style={styles.container}>
                    <BannerAd
                        unitId={AdUnits.banner}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                        onAdLoaded={() => setAdLoaded(true)}
                        onAdFailedToLoad={() => setAdLoaded(false)}
                    />
                </View>
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
