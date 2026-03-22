import { AdUnits } from '@/src/constants/adUnits';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NativeAdCardProps {
    isPremium?: boolean;
    onRateUs?: () => void;
}

export default function NativeAdCard({
    isPremium = false,
    onRateUs,
}: NativeAdCardProps) {

    if (isPremium) return null;

    // Fallback card for dev mode or when ad fails
    const FallbackCard = () => (
        <View style={styles.card}>
            <Text style={styles.adLabel}>Sponsored</Text>
            <Text style={styles.title}>⭐ Enjoying EMI Calculator?</Text>
            <TouchableOpacity style={styles.btn} onPress={onRateUs}>
                <Text style={styles.btnText}>Rate us on Play Store</Text>
            </TouchableOpacity>
        </View>
    );

    if (__DEV__) return <FallbackCard />;

    // Production banner ad (Native Advanced not supported, use standard banner)
    try {
        const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');

        return (
            <View style={styles.adContainer}>
                <Text style={styles.adLabel}>Advertisement</Text>
                <View style={styles.bannerWrapper}>
                    <BannerAd
                        unitId={AdUnits.banner}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: true,
                        }}
                    />
                </View>
            </View>
        );
    } catch (e) {
        return <FallbackCard />;
    }
}

const styles = StyleSheet.create({
    adContainer: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        alignItems: 'center',
    },
    bannerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        overflow: 'hidden',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    adLabel: {
        fontSize: 10,
        color: '#555555',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    btn: {
        backgroundColor: '#00C853',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
});
