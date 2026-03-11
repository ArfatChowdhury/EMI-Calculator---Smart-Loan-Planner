import { Colors, SHADOW } from '@/constants/Colors';
import { useSettings } from '@/src/hooks/useSettings';
import { useSubscription } from '@/src/hooks/useSubscription';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import BannerAdComponent from './BannerAdComponent';

interface PdfGenerationModalProps {
    visible: boolean;
    onComplete: () => void;
}

export default function PdfGenerationModal({ visible, onComplete }: PdfGenerationModalProps) {
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];
    const { isPremium } = useSubscription();

    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Gathering data...');
    const [showAds, setShowAds] = useState(false);

    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setProgress(0);
            setStatusText('Gathering data...');
            setShowAds(true);

            // Animation for progress bar (11 seconds)
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 11000,
                useNativeDriver: false,
            }).start();

            // Status text updates
            const timers = [
                setTimeout(() => setStatusText('Generating PDF structure...'), 3000),
                setTimeout(() => setStatusText('Optimizing tables...'), 6000),
                setTimeout(() => setStatusText('Finalizing report...'), 9000),
                setTimeout(() => setShowAds(false), 10000),
                setTimeout(() => {
                    onComplete();
                }, 11000),
            ];

            return () => {
                timers.forEach(clearTimeout);
                progressAnim.setValue(0);
            };
        }
    }, [visible]);

    const width = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.md]}>
                    <View style={styles.loadingSection}>
                        <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
                            <Ionicons name="document-text" size={40} color={theme.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Generating PDF</Text>
                        <Text style={[styles.statusText, { color: theme.textSecondary }]}>{statusText}</Text>

                        <View style={[styles.progressBackground, { backgroundColor: theme.background }]}>
                            <Animated.View style={[styles.progressFill, { backgroundColor: theme.primary, width }]} />
                        </View>
                    </View>

                    {showAds && !isPremium && (
                        <View style={styles.adSection}>
                            <Text style={[styles.adLabel, { color: theme.textSecondary }]}>Showing Ad while you wait (10s)</Text>
                            <View style={[styles.adContainer, { backgroundColor: theme.background }]}>
                                <BannerAdComponent isPremium={isPremium} />
                            </View>
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
        backgroundColor: '#121212', // Fully opaque for "mock screen" feel
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
    },
    loadingSection: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 24,
    },
    progressBackground: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    adSection: {
        width: '100%',
        alignItems: 'center',
    },
    adLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 12,
        opacity: 0.7,
    },
    adContainer: {
        width: '100%',
        minHeight: 250, // Larger for PDF wait
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
});
