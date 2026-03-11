import { Colors, SHADOW } from '@/constants/Colors';
import { useSettings } from '@/src/hooks/useSettings';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Linking,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface RateUsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function RateUsModal({ visible, onClose }: RateUsModalProps) {
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];
    const [rating, setRating] = useState(0);

    const handleRate = async (stars: number) => {
        setRating(stars);

        // Wait a bit to show the selected stars
        setTimeout(async () => {
            if (stars >= 4) {
                await AsyncStorage.setItem('has_rated_app', 'true');
                // Open Play Store
                Linking.openURL('market://details?id=com.naim.emicalculator').catch(() => {
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.naim.emicalculator');
                });
            } else {
                // If lower rating, maybe send to feedback instead? 
                // For now just close and record prompt
                await AsyncStorage.setItem('last_rate_prompt', Date.now().toString());
            }
            onClose();
        }, 800);
    };

    const handleLater = async () => {
        await AsyncStorage.setItem('last_rate_prompt', Date.now().toString());
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Use BlurView if available, otherwise fallback to semi-transparent view */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />

                <View style={[styles.content, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.md]}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
                            <Ionicons name="star" size={40} color={theme.primary} />
                        </View>
                    </View>

                    <Text style={[styles.title, { color: theme.textPrimary }]}>Enjoying Limners?</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        Your feedback helps us create a better experience for everyone. Would you mind taking a moment to rate us?
                    </Text>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => handleRate(star)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={rating >= star ? "star" : "star-outline"}
                                    size={42}
                                    color={rating >= star ? theme.primary : theme.textSecondary}
                                    style={styles.starIcon}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.laterButton, { backgroundColor: theme.background }]}
                            onPress={handleLater}
                        >
                            <Text style={[styles.laterText, { color: theme.textSecondary }]}>Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
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
    iconContainer: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 32,
        fontWeight: '500',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 8,
    },
    starIcon: {
        marginHorizontal: 2,
    },
    buttonContainer: {
        width: '100%',
    },
    laterButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        width: '100%',
    },
    laterText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
