import { Colors } from '@/constants/Colors';
import DonutChart from '@/src/components/DonutChart';
import SliderInput from '@/src/components/SliderInput';
import { useLoans } from '@/src/hooks/useLoans';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import {
    calculateFlatEMI,
    calculatePrepaymentSavings,
    calculateReducingEMI,
    generateAmortizationSchedule
} from '@/src/utils/emiCalculations';
import { generateLoanPDF } from '@/src/utils/pdfGenerator';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CalculationResults {
    emi: number;
    totalInterest: number;
    totalPayable: number;
    savings: {
        newTenure: number;
        tenureSaved: number;
        interestSaved: number;
    } | null;
}

export default function CalculatorScreen() {
    const { saveLoan } = useLoans();
    const [amount, setAmount] = useState<number>(500000);
    const [rate, setRate] = useState<number>(9.5);
    const [tenure, setTenure] = useState<number>(60);
    const [tenureType, setTenureType] = useState<'months' | 'years'>('months');
    const [loanType, setLoanType] = useState<'reducing' | 'flat'>('reducing');

    const [addPrepayment, setAddPrepayment] = useState<boolean>(false);
    const [extraMonthly, setExtraMonthly] = useState<number>(5000);

    const [results, setResults] = useState<CalculationResults | null>(null);

    const handleCalculate = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        let emi = 0;
        const actualTenureMonths = tenureType === 'years' ? tenure * 12 : tenure;

        if (loanType === 'reducing') {
            emi = calculateReducingEMI(amount, rate, actualTenureMonths);
        } else {
            emi = calculateFlatEMI(amount, rate, actualTenureMonths);
        }

        const totalPayable = emi * actualTenureMonths;
        const totalInterest = totalPayable - amount;

        let savings = null;
        if (addPrepayment && loanType === 'reducing') {
            savings = calculatePrepaymentSavings(amount, rate, actualTenureMonths, extraMonthly);
        }

        setResults({
            emi,
            totalInterest,
            totalPayable,
            savings,
        });
    };

    const handleSave = async () => {
        if (!results) return;

        try {
            await saveLoan({
                label: `Loan #${Date.now().toString().slice(-4)}`,
                principal: amount,
                annualRate: rate,
                tenureMonths: tenureType === 'years' ? tenure * 12 : tenure,
                monthlyEMI: results.emi,
                currency: 'BDT',
                loanType: loanType,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Loan saved to My Loans');
        } catch (error) {
            Alert.alert('Error', 'Failed to save loan');
        }
    };

    const handleExportPDF = async () => {
        if (!results) return;

        try {
            const actualTenureMonths = tenureType === 'years' ? tenure * 12 : tenure;
            const schedule = generateAmortizationSchedule(amount, rate, actualTenureMonths);

            await generateLoanPDF({
                principal: amount,
                rate: rate,
                tenure: actualTenureMonths,
                emi: results.emi,
                totalInterest: results.totalInterest,
                totalPayable: results.totalPayable
            }, schedule);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF');
        }
    };

    const toggleTenureType = (type: 'months' | 'years') => {
        if (type === tenureType) return;

        if (type === 'years') {
            setTenure(Math.max(1, Math.floor(tenure / 12)));
        } else {
            setTenure(tenure * 12);
        }
        setTenureType(type);
    };

    const handleTenureChange = (val: number) => {
        setTenure(val);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>EMI Calculator</Text>
                    <Text style={styles.subtitle}>Plan your loans easily</Text>
                </View>

                <View style={styles.card}>
                    <SliderInput
                        label="Loan Amount"
                        value={amount}
                        onChange={setAmount}
                        min={1000}
                        max={10000000}
                        step={1000}
                        prefix="৳"
                    />

                    <SliderInput
                        label="Interest Rate"
                        value={rate}
                        onChange={setRate}
                        min={1}
                        max={36}
                        step={0.1}
                        unit="%"
                    />

                    <View style={styles.tenureHeader}>
                        <Text style={styles.label}>Loan Tenure</Text>
                        <View style={styles.toggleGroup}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, tenureType === 'months' && styles.toggleBtnActive]}
                                onPress={() => toggleTenureType('months')}
                            >
                                <Text style={[styles.toggleText, tenureType === 'months' && styles.toggleTextActive]}>Months</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, tenureType === 'years' && styles.toggleBtnActive]}
                                onPress={() => toggleTenureType('years')}
                            >
                                <Text style={[styles.toggleText, tenureType === 'years' && styles.toggleTextActive]}>Years</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SliderInput
                        label=""
                        value={tenure}
                        onChange={handleTenureChange}
                        min={1}
                        max={tenureType === 'months' ? 360 : 30}
                        unit={tenureType === 'months' ? ' Mo' : ' Yr'}
                    />

                    <View style={styles.typeContainer}>
                        <Text style={styles.label}>Loan Type</Text>
                        <View style={styles.typeSelectors}>
                            <TouchableOpacity
                                style={[styles.typeBtn, loanType === 'reducing' && styles.typeBtnActive]}
                                onPress={() => setLoanType('reducing')}
                            >
                                <Text style={[styles.typeText, loanType === 'reducing' && styles.typeTextActive]}>Reducing Balance</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, loanType === 'flat' && styles.typeBtnActive]}
                                onPress={() => setLoanType('flat')}
                            >
                                <Text style={[styles.typeText, loanType === 'flat' && styles.typeTextActive]}>Flat Rate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loanType === 'reducing' && (
                        <TouchableOpacity
                            style={styles.prepaymentToggle}
                            onPress={() => setAddPrepayment(!addPrepayment)}
                        >
                            <Text style={styles.prepaymentLabel}>Add Monthly Prepayment</Text>
                            <View style={[styles.toggleSwitch, addPrepayment && styles.toggleSwitchActive]}>
                                <View style={[styles.toggleCircle, addPrepayment && styles.toggleCircleActive]} />
                            </View>
                        </TouchableOpacity>
                    )}

                    {addPrepayment && loanType === 'reducing' && (
                        <SliderInput
                            label="Extra Monthly Payment"
                            value={extraMonthly}
                            onChange={setExtraMonthly}
                            min={500}
                            max={100000}
                            step={500}
                            prefix="৳"
                        />
                    )}

                    <TouchableOpacity style={styles.calculateBtn} onPress={handleCalculate}>
                        <Text style={styles.calculateBtnText}>Calculate EMI</Text>
                    </TouchableOpacity>
                </View>

                {results && (
                    <View style={styles.resultsSection}>
                        <View style={styles.resultCard}>
                            <Text style={styles.resultLabel}>Monthly EMI</Text>
                            <Text style={styles.emiValue}>{formatCurrency(results.emi)}</Text>
                        </View>

                        {results.savings && (
                            <View style={[styles.resultCard, styles.savingsCard]}>
                                <Text style={styles.savingsTitle}>Prepayment Savings</Text>
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryMiniCard}>
                                        <Text style={styles.summaryLabel}>Interest Saved</Text>
                                        <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                                            {formatCurrency(results.savings.interestSaved)}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryMiniCard}>
                                        <Text style={styles.summaryLabel}>Tenure Saved</Text>
                                        <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                                            {results.savings.tenureSaved} Months
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.savingsText}>
                                    Your loan will close in {results.savings.newTenure} months.
                                </Text>
                            </View>
                        )}

                        <View style={styles.summaryRow}>
                            <View style={styles.summaryMiniCard}>
                                <Text style={styles.summaryLabel}>Total Interest</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(results.totalInterest)}</Text>
                            </View>
                            <View style={styles.summaryMiniCard}>
                                <Text style={styles.summaryLabel}>Total Amount</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(results.totalPayable)}</Text>
                            </View>
                        </View>

                        <DonutChart principal={amount} interest={results.totalInterest} />

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
                                <Text style={styles.actionBtnText}>Save Loan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleExportPDF}>
                                <Text style={styles.actionBtnText}>Export PDF</Text>
                            </TouchableOpacity>
                        </View>
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
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    label: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '600',
        marginBottom: 8,
    },
    tenureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    toggleGroup: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 4,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    toggleBtnActive: {
        backgroundColor: Colors.primary,
    },
    toggleText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: Colors.white,
    },
    typeContainer: {
        marginTop: 10,
        marginBottom: 24,
    },
    typeSelectors: {
        flexDirection: 'row',
        gap: 12,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    typeBtnActive: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(0, 200, 83, 0.1)',
    },
    typeText: {
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    typeTextActive: {
        color: Colors.primary,
    },
    calculateBtn: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    calculateBtnText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    prepaymentToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 8,
    },
    prepaymentLabel: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    toggleSwitch: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.border,
        padding: 2,
    },
    toggleSwitchActive: {
        backgroundColor: Colors.primary,
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.white,
    },
    toggleCircleActive: {
        transform: [{ translateX: 20 }],
    },
    resultsSection: {
        marginTop: 24,
        marginBottom: 40,
    },
    resultCard: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    savingsCard: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(0, 200, 83, 0.05)',
    },
    savingsTitle: {
        color: Colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    savingsText: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 12,
        fontStyle: 'italic',
    },
    resultLabel: {
        color: Colors.textSecondary,
        fontSize: 16,
        marginBottom: 8,
    },
    emiValue: {
        color: Colors.primary,
        fontSize: 36,
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    summaryMiniCard: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    summaryLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    summaryValue: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary,
        alignItems: 'center',
    },
    actionBtnText: {
        color: Colors.primary,
        fontWeight: '600',
    },
});
