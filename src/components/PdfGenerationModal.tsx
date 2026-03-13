import { AdUnits } from '@/src/constants/adUnits';
import { useSubscription } from '@/src/hooks/useSubscription';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

interface Props {
    visible: boolean;
    onComplete: () => void;
}

export default function PdfGenerationModal({ visible, onComplete }: Props) {
    const { isPremium } = useSubscription();
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const animValue = useRef(new Animated.Value(0)).current;

    const steps = [
        'Gathering loan data...',
        'Calculating amortization...',
        'Generating charts...',
        'Formatting PDF...',
        'Almost done...',
    ];

    useEffect(() => {
        if (!visible) {
            setProgress(0);
            setStep(0);
            return;
        }

        // Animate progress over 3 seconds for a smoother experience
        let elapsed = 0;
        const totalDuration = 3000;
        const interval = setInterval(() => {
            elapsed += 100;
            const pct = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(pct);
            setStep(Math.floor((pct / 100) * steps.length));
            if (pct >= 100) {
                clearInterval(interval);
                setTimeout(onComplete, 500);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>📄 Generating PDF</Text>
                    <Text style={styles.step}>{steps[Math.min(step, steps.length - 1)]}</Text>

                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.pct}>{Math.round(progress)}%</Text>

                    {/* Banner ad inside modal */}
                    {!isPremium && (
                        <View style={{ marginTop: 20, width: '100%' }}>
                            {__DEV__ ? (
                                <View style={styles.adPlaceholder}>
                                    <Text style={styles.adText}>[ Ad Banner ]</Text>
                                </View>
                            ) : (
                                (() => {
                                    try {
                                        const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');
                                        return (
                                            <BannerAd
                                                unitId={AdUnits.banner}
                                                size={BannerAdSize.BANNER}
                                                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                                            />
                                        );
                                    } catch (e) { return null; }
                                })()
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        alignItems: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 12,
    },
    step: {
        color: '#AAAAAA',
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
    },
    progressBg: {
        width: '100%',
        height: 8,
        backgroundColor: '#333',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    pct: {
        color: '#10B981',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 8,
    },
    adPlaceholder: {
        height: 50,
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    adText: { color: '#555', fontSize: 12 },
});
