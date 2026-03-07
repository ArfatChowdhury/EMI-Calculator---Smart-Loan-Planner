import { Colors } from '@/constants/Colors';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LoanCard = ({ loan, onPress }) => {
    // Simple progress calculation (for now just placeholder 0%)
    const progress = 0;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.label}>{loan.label || 'Loan'}</Text>
                <Text style={styles.emi}>{formatCurrency(loan.monthlyEMI, loan.currency)}/mo</Text>
            </View>

            <View style={styles.details}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Principal</Text>
                    <Text style={styles.detailValue}>{formatCurrency(loan.principal, loan.currency)}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Rate</Text>
                    <Text style={styles.detailValue}>{loan.annualRate}%</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Tenure</Text>
                    <Text style={styles.detailValue}>{loan.tenureMonths} Mo</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}% Paid</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    emi: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailItem: {
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: Colors.border,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
    },
    progressText: {
        fontSize: 11,
        color: Colors.textSecondary,
        textAlign: 'right',
    },
});

export default LoanCard;
