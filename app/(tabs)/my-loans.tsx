import { Colors } from '@/constants/Colors';
import BannerAdComponent from '@/src/components/BannerAdComponent';
import LoanCard from '@/src/components/LoanCard';
import NativeAdCard from '@/src/components/NativeAdCard';
import { useLoanContext } from '@/src/context/LoanContext';
import { useSettings } from '@/src/hooks/useSettings';
import { useSubscription } from '@/src/hooks/useSubscription';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Loan {
    id: string;
    label: string;
    principal: number;
    annualRate: number;
    tenureMonths: number;
    monthlyEMI: number;
    currency: string;
    loanType: string;
}

export default function MyLoansScreen() {
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];
    const { loans, loading, deleteLoan, setActiveLoan } = useLoanContext();
    const router = useRouter();
    const { isPremium } = useSubscription();

    const listDataWithAds = (loans as Loan[]).flatMap((item, index) => {
        // Show native ad after 1st loan, then every 3 loans for max revenue
        if (index === 0 || (index > 0 && (index) % 3 === 0)) {
            return [item, { type: 'AD', id: `ad_${index}` }];
        }
        return [item];
    });

    const totalOutstanding = (loans as Loan[]).reduce((acc, loan) => acc + loan.principal, 0);

    const handleEdit = (loan: Loan) => {
        setActiveLoan(loan);
        router.push('/(tabs)');
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Loan',
            'Are you sure you want to delete this loan?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteLoan(id) }
            ]
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { backgroundColor: theme.gray100 }]}>
                <Text style={{ fontSize: 40 }}>📁</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No loans saved yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Calculate and save your first loan to track it here.</Text>
        </View>
    );

    const renderHeader = () => (
        <Animated.View entering={FadeInUp.duration(600)} style={styles.summarySection}>
            <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
                <Text style={styles.summaryLabel}>Total Outstanding</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalOutstanding, settings.currency)}</Text>
                <View style={styles.loanCountBadge}>
                    <Text style={styles.loanCountText}>{loans.length} Active Loans</Text>
                </View>
            </View>
        </Animated.View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>My Loans</Text>

                <FlatList
                    data={listDataWithAds}
                    keyExtractor={(item: any) => item.id}
                    ListHeaderComponent={loans.length > 0 ? renderHeader : null}
                    renderItem={({ item }: any) => {
                        if (item.type === 'AD') {
                            return (
                                <NativeAdCard
                                    isPremium={isPremium}
                                    onRateUs={() => {
                                        // TODO: Add Play Store link
                                    }}
                                />
                            );
                        }
                        return (
                            <LoanCard
                                loan={item}
                                onPress={() => handleEdit(item)}
                                onEdit={() => handleEdit(item)}
                                onDelete={() => handleDelete(item.id)}
                            />
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
                {loans.length > 0 && <BannerAdComponent isPremium={isPremium} />}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 20,
    },
    summarySection: {
        marginBottom: 24,
    },
    summaryCard: {
        borderRadius: 32,
        padding: 28,
        overflow: 'hidden',
        alignItems: 'center',
        elevation: 6,
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    summaryLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '700',
    },
    summaryValue: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '900',
        marginVertical: 8,
    },
    loanCountBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    loanCountText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
    listContent: {
        paddingBottom: 80, // Extra padding for the fixed ad
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 40,
        fontWeight: '600',
    },
});
