import { Colors, SHADOW } from '@/constants/Colors';
import { useSettings } from '@/src/hooks/useSettings';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Loan {
    id: string;
    label: string;
    principal: number;
    annualRate: number;
    tenureMonths: number;
    monthlyEMI: number;
    currency: string;
}

interface LoanCardProps {
    loan: Loan;
    onPress: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
}

const LoanCard = ({ loan, onPress, onDelete, onEdit }: LoanCardProps) => {
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];

    // Placeholder progress
    const progress = 0;

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                <View style={styles.header}>
                    <View style={styles.labelContainer}>
                        <View style={[styles.iconBox, { backgroundColor: settings.theme === 'dark' ? 'rgba(255,255,255,0.05)' : theme.background }]}>
                            <Ionicons name="briefcase" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.label, { color: theme.textPrimary }]}>{loan.label || 'Loan'}</Text>
                            <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Reducing Balance</Text>
                        </View>
                    </View>
                    <View style={styles.actionsContainer}>
                        {onEdit && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]}
                                onPress={(e) => { e.stopPropagation(); onEdit(); }}
                            >
                                <Ionicons name="pencil" size={16} color={theme.primary} />
                            </TouchableOpacity>
                        )}
                        {onDelete && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: theme.expense + '15' }]}
                                onPress={(e) => { e.stopPropagation(); onDelete(); }}
                            >
                                <Ionicons name="trash" size={16} color={theme.expense} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.emiContainer}>
                            <Text style={[styles.emiValue, { color: theme.primary }]}>{formatCurrency(loan.monthlyEMI, loan.currency)}</Text>
                            <Text style={[styles.emiLabel, { color: theme.textSecondary }]}>/mo</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.detailsGrid, { borderBottomColor: theme.border }]}>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Principal</Text>
                        <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{formatCurrency(loan.principal, loan.currency)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Rate</Text>
                        <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{loan.annualRate}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Tenure</Text>
                        <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{loan.tenureMonths} Mo</Text>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>Repayment Progress</Text>
                        <Text style={[styles.progressPercentage, { color: theme.primary }]}>{progress}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    label: {
        fontSize: 17,
        fontWeight: '800',
    },
    subLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emiContainer: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    emiValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    emiLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 20,
        borderBottomWidth: 1,
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    progressSection: {
        marginTop: 4,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    progressPercentage: {
        fontSize: 13,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
});

export default LoanCard;
