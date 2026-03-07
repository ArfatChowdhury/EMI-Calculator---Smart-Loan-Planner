import { Colors } from '@/constants/Colors';
import SliderInput from '@/src/components/SliderInput';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import { calculateReducingEMI } from '@/src/utils/emiCalculations';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompareScreen() {
    const [loan1, setLoan1] = useState({ amount: 500000, rate: 9.5, tenure: 60 });
    const [loan2, setLoan2] = useState({ amount: 500000, rate: 10.5, tenure: 60 });
    const [results, setResults] = useState<any>(null);

    const handleCompare = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const emi1 = calculateReducingEMI(loan1.amount, loan1.rate, loan1.tenure);
        const totalPayable1 = emi1 * loan1.tenure;
        const totalInterest1 = totalPayable1 - loan1.amount;

        const emi2 = calculateReducingEMI(loan2.amount, loan2.rate, loan2.tenure);
        const totalPayable2 = emi2 * loan2.tenure;
        const totalInterest2 = totalPayable2 - loan2.amount;

        setResults({
            loan1: { emi: emi1, totalInterest: totalInterest1, totalPayable: totalPayable1 },
            loan2: { emi: emi2, totalInterest: totalInterest2, totalPayable: totalPayable2 },
            diff: {
                emi: emi1 - emi2,
                interest: totalInterest1 - totalInterest2,
                total: totalPayable1 - totalPayable2
            }
        });
    };

    const renderComparisonRow = (label: string, val1: any, val2: any, isCurrency = true) => {
        const diff = val1 - val2;
        const isLoan1Better = diff < 0;

        return (
            <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>{label}</Text>
                <View style={styles.compareValues}>
                    <View style={[styles.valCard, isLoan1Better && styles.betterCard]}>
                        <Text style={[styles.valText, isLoan1Better && styles.betterText]}>
                            {isCurrency ? formatCurrency(val1) : val1}
                        </Text>
                    </View>
                    <View style={[styles.valCard, !isLoan1Better && diff !== 0 && styles.betterCard]}>
                        <Text style={[styles.valText, !isLoan1Better && diff !== 0 && styles.betterText]}>
                            {isCurrency ? formatCurrency(val2) : val2}
                        </Text>
                    </View>
                </View>
                {diff !== 0 && (
                    <Text style={[styles.diffText, diff < 0 ? styles.positiveDiff : styles.negativeDiff]}>
                        Difference: {formatCurrency(Math.abs(diff))}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Compare Loans</Text>

                <View style={styles.inputContainer}>
                    <View style={styles.loanColumn}>
                        <Text style={styles.columnHeader}>Loan 1</Text>
                        <SliderInput
                            label="Amount"
                            value={loan1.amount}
                            onChange={(v) => setLoan1({ ...loan1, amount: v })}
                            min={1000}
                            max={10000000}
                            step={1000}
                            compact
                        />
                        <SliderInput
                            label="Rate (%)"
                            value={loan1.rate}
                            onChange={(v) => setLoan1({ ...loan1, rate: v })}
                            min={1}
                            max={30}
                            step={0.1}
                            compact
                        />
                        <SliderInput
                            label="Tenure (Mo)"
                            value={loan1.tenure}
                            onChange={(v) => setLoan1({ ...loan1, tenure: v })}
                            min={1}
                            max={360}
                            compact
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.loanColumn}>
                        <Text style={styles.columnHeader}>Loan 2</Text>
                        <SliderInput
                            label="Amount"
                            value={loan2.amount}
                            onChange={(v) => setLoan2({ ...loan2, amount: v })}
                            min={1000}
                            max={10000000}
                            step={1000}
                            compact
                        />
                        <SliderInput
                            label="Rate (%)"
                            value={loan2.rate}
                            onChange={(v) => setLoan2({ ...loan2, rate: v })}
                            min={1}
                            max={30}
                            step={0.1}
                            compact
                        />
                        <SliderInput
                            label="Tenure (Mo)"
                            value={loan2.tenure}
                            onChange={(v) => setLoan2({ ...loan2, tenure: v })}
                            min={1}
                            max={360}
                            compact
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.compareBtn} onPress={handleCompare}>
                    <Text style={styles.compareBtnText}>Compare Now</Text>
                </TouchableOpacity>

                {results && (
                    <View style={styles.resultsContainer}>
                        {renderComparisonRow('Monthly EMI', results.loan1.emi, results.loan2.emi)}
                        {renderComparisonRow('Total Interest', results.loan1.totalInterest, results.loan2.totalInterest)}
                        {renderComparisonRow('Total Payable', results.loan1.totalPayable, results.loan2.totalPayable)}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 20,
    },
    loanColumn: {
        flex: 1,
    },
    columnHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
        marginBottom: 12,
    },
    divider: {
        width: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 12,
    },
    compareBtn: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    compareBtnText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultsContainer: {
        gap: 16,
    },
    compareRow: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    compareLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: '600',
    },
    compareValues: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    valCard: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    betterCard: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(0, 200, 83, 0.05)',
    },
    valText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    betterText: {
        color: Colors.primary,
    },
    diffText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    positiveDiff: {
        color: Colors.primary,
    },
    negativeDiff: {
        color: '#FF5252',
    },
});
