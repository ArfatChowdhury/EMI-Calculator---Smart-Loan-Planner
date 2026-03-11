import { Colors, SHADOW } from '@/constants/Colors';
import { Currencies } from '@/constants/Currencies';
import SliderInput from '@/src/components/SliderInput';
import { useSettings } from '@/src/hooks/useSettings';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import { calculateReducingEMI } from '@/src/utils/emiCalculations';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import BannerAdComponent from '@/src/components/BannerAdComponent';
import { useSubscription } from '@/src/hooks/useSubscription';

export default function CompareScreen() {
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];
    const { isPremium } = useSubscription();
    const [loan1, setLoan1] = useState({ amount: 500000, rate: 9.5, tenure: 60 });
    const [loan2, setLoan2] = useState({ amount: 500000, rate: 10.5, tenure: 60 });
    const [results, setResults] = useState<any>(null);

    const currencySymbol = Currencies.find(c => c.code === settings.currency)?.symbol || '$';

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

    const renderComparisonCard = (label: string, val1: number, val2: number, isCurrency = true) => {
        const diff = val1 - val2;
        const isLoan1Better = diff < 0;

        return (
            <View style={[styles.compareCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                <Text style={[styles.compareLabel, { color: theme.textSecondary }]}>{label}</Text>
                <View style={styles.compareValues}>
                    <View style={[styles.valBox, { backgroundColor: theme.background }, isLoan1Better && { backgroundColor: `${theme.primary}10`, borderColor: theme.primary, borderWidth: 1 }]}>
                        <Text style={[styles.valText, { color: theme.textPrimary }, isLoan1Better && { color: theme.primary }]}>
                            {isCurrency ? formatCurrency(val1, settings.currency) : val1}
                        </Text>
                        <Text style={[styles.loanTag, { color: theme.textSecondary }]}>LOAN 1</Text>
                    </View>
                    <View style={[styles.valBox, { backgroundColor: theme.background }, !isLoan1Better && diff !== 0 && { backgroundColor: `${theme.primary}10`, borderColor: theme.primary, borderWidth: 1 }]}>
                        <Text style={[styles.valText, { color: theme.textPrimary }, !isLoan1Better && diff !== 0 && { color: theme.primary }]}>
                            {isCurrency ? formatCurrency(val2, settings.currency) : val2}
                        </Text>
                        <Text style={[styles.loanTag, { color: theme.textSecondary }]}>LOAN 2</Text>
                    </View>
                </View>
                {diff !== 0 && (
                    <View style={[styles.diffBanner, { backgroundColor: diff < 0 ? `${theme.income}10` : `${theme.expense}10` }]}>
                        <Ionicons name={diff < 0 ? "arrow-down-circle" : "arrow-up-circle"} size={16} color={diff < 0 ? theme.income : theme.expense} />
                        <Text style={[styles.diffText, { color: diff < 0 ? theme.income : theme.expense }]}>
                            Difference: {formatCurrency(Math.abs(diff), settings.currency)}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>Compare Loans</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Find the best deal for you</Text>
                </View>

                <View style={styles.inputGrid}>
                    <View style={[styles.sideCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                        <Text style={[styles.sideTitle, { color: '#3B82F6' }]}>Loan 1</Text>
                        <SliderInput
                            label="Amount"
                            value={loan1.amount}
                            onChange={(v: number) => setLoan1({ ...loan1, amount: v })}
                            min={1000}
                            max={10000000}
                            step={1000}
                            prefix={currencySymbol}
                            compact
                        />
                        <SliderInput
                            label="Rate (%)"
                            value={loan1.rate}
                            onChange={(v: number) => setLoan1({ ...loan1, rate: v })}
                            min={1}
                            max={30}
                            step={0.1}
                            compact
                        />
                        <SliderInput
                            label="Tenure (Mo)"
                            value={loan1.tenure}
                            onChange={(v: number) => setLoan1({ ...loan1, tenure: v })}
                            min={1}
                            max={360}
                            compact
                        />
                    </View>

                    <View style={[styles.sideCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                        <Text style={[styles.sideTitle, { color: '#F59E0B' }]}>Loan 2</Text>
                        <SliderInput
                            label="Amount"
                            value={loan2.amount}
                            onChange={(v: number) => setLoan2({ ...loan2, amount: v })}
                            min={1000}
                            max={10000000}
                            step={1000}
                            prefix={currencySymbol}
                            compact
                        />
                        <SliderInput
                            label="Rate (%)"
                            value={loan2.rate}
                            onChange={(v: number) => setLoan2({ ...loan2, rate: v })}
                            min={1}
                            max={30}
                            step={0.1}
                            compact
                        />
                        <SliderInput
                            label="Tenure (Mo)"
                            value={loan2.tenure}
                            onChange={(v: number) => setLoan2({ ...loan2, tenure: v })}
                            min={1}
                            max={360}
                            compact
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.compareBtn, { backgroundColor: theme.primary }]}
                    onPress={handleCompare}
                    activeOpacity={0.8}
                >
                    <Text style={styles.compareBtnText}>Compare Now</Text>
                    <Ionicons name="git-compare-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                {results && (
                    <Animated.View entering={FadeInUp.duration(600)} style={styles.resultsContainer}>
                        {renderComparisonCard('Monthly EMI', results.loan1.emi, results.loan2.emi)}
                        {renderComparisonCard('Total Interest', results.loan1.totalInterest, results.loan2.totalInterest)}
                        {renderComparisonCard('Total Payable', results.loan1.totalPayable, results.loan2.totalPayable)}
                    </Animated.View>
                )}
            </ScrollView>

            <View style={[styles.bottomAdContainer, { borderTopColor: theme.border }]}>
                <BannerAdComponent isPremium={isPremium} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 80,
    },
    bottomAdContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
        paddingVertical: 4,
        borderTopWidth: 0.5,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
        fontWeight: '600',
    },
    inputGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    sideCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    sideTitle: {
        fontSize: 14,
        fontWeight: '900',
        marginBottom: 16,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    compareBtn: {
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        ...SHADOW.md,
    },
    compareBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    resultsContainer: {
        gap: 16,
    },
    compareCard: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
    },
    compareLabel: {
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    compareValues: {
        flexDirection: 'row',
        gap: 12,
    },
    valBox: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderColor: 'transparent',
        borderWidth: 1,
    },
    valText: {
        fontSize: 16,
        fontWeight: '900',
    },
    loanTag: {
        fontSize: 10,
        fontWeight: '800',
        marginTop: 4,
        opacity: 0.6,
    },
    diffBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    diffText: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 6,
    },
});
