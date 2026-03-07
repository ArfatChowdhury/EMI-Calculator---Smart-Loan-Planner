import { Colors } from '@/constants/Colors';
import LoanCard from '@/src/components/LoanCard';
import { useLoans } from '@/src/hooks/useLoans';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';
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
    const { loans, loading } = useLoans();

    const totalOutstanding = (loans as Loan[]).reduce((acc, loan) => acc + loan.principal, 0);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No loans saved yet</Text>
            <Text style={styles.emptySubtitle}>Calculate and save your first loan to track it here.</Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Outstanding</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalOutstanding)}</Text>
            <View style={styles.loanCountBadge}>
                <Text style={styles.loanCountText}>{loans.length} Active Loans</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>My Loans</Text>

                {loans.length > 0 && renderHeader()}

                <FlatList
                    data={loans as Loan[]}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <LoanCard loan={item} onPress={() => { }} />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    summaryLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
    summaryValue: {
        color: Colors.white,
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    loanCountBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    loanCountText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
