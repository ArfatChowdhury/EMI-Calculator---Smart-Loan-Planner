import { Colors, SHADOW } from '@/constants/Colors';
import { useSettings } from '@/src/hooks/useSettings';
import { useSubscription } from '@/src/hooks/useSubscription';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BannerAdComponent from './BannerAdComponent';

interface SaveSuccessModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SaveSuccessModal({ visible, onClose }: SaveSuccessModalProps) {
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];
    const { isPremium } = useSubscription();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.md]}>
                    <View style={styles.header}>
                        <View style={[styles.successCircle, { backgroundColor: `${theme.income}20` }]}>
                            <Ionicons name="checkmark-done" size={40} color={theme.income} />
                        </View>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Loan Saved!</Text>
                        <Text style={[styles.description, { color: theme.textSecondary }]}>
                            You can view and manage your saved loans in the "My Loans" tab.
                        </Text>
                    </View>

                    <BannerAdComponent isPremium={isPremium} />

                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: theme.primary }]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Done</Text>
                    </TouchableOpacity>
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
    content: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    successCircle: {
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
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    adSection: {
        width: '100%',
        marginBottom: 24,
        alignItems: 'center',
    },
    adLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    adContainer: {
        width: '100%',
        minHeight: 100,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    closeButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
