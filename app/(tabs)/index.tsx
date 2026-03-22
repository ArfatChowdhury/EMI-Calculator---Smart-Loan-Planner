import { Colors, SHADOW } from '@/constants/Colors';
import { Currencies } from '@/constants/Currencies';
import BannerAdComponent from '@/src/components/BannerAdComponent';
import DonutChart from '@/src/components/DonutChart';
import PdfGenerationModal from '@/src/components/PdfGenerationModal';
import SaveSuccessModal from '@/src/components/SaveSuccessModal';
import SliderInput from '@/src/components/SliderInput';
import { useLoanContext } from '@/src/context/LoanContext';
import { useSettings } from '@/src/hooks/useSettings';
import { useSubscription } from '@/src/hooks/useSubscription';
import { formatCurrency } from '@/src/utils/currencyFormatter';
import {
    calculateFlatEMI,
    calculatePrepaymentSavings,
    calculateReducingEMI,
    generateAmortizationSchedule
} from '@/src/utils/emiCalculations';
import { generateLoanPDF } from '@/src/utils/pdfGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    LayoutChangeEvent,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface CalculationResults {
    emi: number;
    totalInterest: number;
    totalPayable: number;
    endDate: string;
    savings: {
        newTenure: number;
        tenureSaved: number;
        interestSaved: number;
    } | null;
}

export default function CalculatorScreen() {
    const { settings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];

    const { activeLoan, setActiveLoan, saveLoan } = useLoanContext();
    const scrollRef = useRef<ScrollView>(null);
    const resultsRef = useRef<number>(0);
    const [chartWidth, setChartWidth] = useState(0);

    const currencySymbol = Currencies.find(c => c.code === settings.currency)?.symbol || '$';

    const [amount, setAmount] = useState<number>(500000);
    const [rate, setRate] = useState<number>(9.5);
    const [tenure, setTenure] = useState<number>(60);
    const [refreshing, setRefreshing] = useState(false);
    const [tenureType, setTenureType] = useState<'months' | 'years'>('months');
    const [loanType, setLoanType] = useState<'reducing' | 'flat'>('reducing');

    const [addPrepayment, setAddPrepayment] = useState<boolean>(false);
    const [extraMonthly, setExtraMonthly] = useState<number>(5000);

    const [results, setResults] = useState<any>(null);
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const [pdfExportsToday, setPdfExportsToday] = useState(0);

    const { isPremium, purchasePremium } = useSubscription();

    useEffect(() => {
        checkPdfLimit();
    }, []);

    const checkPdfLimit = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const storedDate = await AsyncStorage.getItem('@pdf_export_date');
            const storedCount = await AsyncStorage.getItem('@pdf_export_count');

            if (storedDate === today) {
                setPdfExportsToday(parseInt(storedCount || '0'));
            } else {
                await AsyncStorage.setItem('@pdf_export_date', today);
                await AsyncStorage.setItem('@pdf_export_count', '0');
                setPdfExportsToday(0);
            }
        } catch (e) {
            console.error('Failed to check PDF limit', e);
        }
    };

    // Glow animation for EMI
    const glowAnim = useSharedValue(1);

    React.useEffect(() => {
        if (results) {
            glowAnim.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1500 }),
                    withTiming(1, { duration: 1500 })
                ),
                -1,
                true
            );
        }
    }, [results]);

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowAnim.value }],
        textShadowRadius: withTiming(glowAnim.value * 8),
    }));

    // Handle editing loan
    React.useEffect(() => {
        if (activeLoan) {
            setAmount(activeLoan.principal);
            setRate(activeLoan.annualRate);
            setTenure(activeLoan.tenureMonths);
            setTenureType('months');
            setLoanType((activeLoan.loanType as 'reducing' | 'flat') || 'reducing');

            // Trigger calculation
            setTimeout(handleCalculate, 300);

            // Clear active loan so it doesn't overwrite changes on every render
            setActiveLoan(null);
        }
    }, [activeLoan]);

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

        // Calculate end date
        const endDateObj = new Date();
        endDateObj.setMonth(endDateObj.getMonth() + actualTenureMonths);
        const endDate = endDateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        let savings = null;
        if (addPrepayment && loanType === 'reducing') {
            savings = calculatePrepaymentSavings(amount, rate, actualTenureMonths, extraMonthly);
        }

        setResults({
            emi,
            totalInterest,
            totalPayable,
            endDate,
            savings,
        });

        // Auto-scroll to results smoothly
        // If results just appeared, onLayout might not have fired yet. 
        // We'll scroll after a slightly longer delay or check positions.
        setTimeout(() => {
            if (resultsRef.current > 0) {
                scrollRef.current?.scrollTo({
                    y: resultsRef.current - 20, // offset slightly
                    animated: true,
                });
            } else {
                // Fallback scroll to end if layout hasn't updated
                scrollRef.current?.scrollToEnd({ animated: true });
            }
        }, 150);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setAmount(500000);
        setRate(9.5);
        setTenure(60);
        setTenureType('months');
        setResults(null);
        setTimeout(() => setRefreshing(false), 800);
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
                currency: settings.currency,
                loanType: loanType,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSaveModalVisible(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to save loan');
        }
    };

    const interstitialRef = useRef<any>(null);

    const preloadPdfAd = async () => {
        if (__DEV__ || isPremium) return;
        try {
            const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');
            const { AdUnits } = require('@/src/constants/adUnits');

            const interstitial = InterstitialAd.createForAdRequest(AdUnits.interstitial, {
                requestNonPersonalizedAdsOnly: true,
            });

            interstitial.addAdEventListener(AdEventType.LOADED, () => {
                interstitialRef.current = interstitial;
            });

            interstitial.load();
        } catch (e) {
            console.warn('PDF ad preload error:', e);
        }
    };

    useEffect(() => {
        if (results) {
            preloadPdfAd();
        }
    }, [results]);

    const handleExportPDF = async () => {
        if (!results) return;

        /*
        if (!isPremium && pdfExportsToday >= 3) {
            Alert.alert(
                '🎉 Lifetime Benefits',
                'Get unlimited PDF exports and remove all ads with a one-time lifetime purchase!',
                [
                    { text: 'Not Now', style: 'cancel' },
                    { text: 'Buy Lifetime', onPress: purchasePremium }
                ]
            );
            return;
        }
        */

        // Show preloaded ad if available
        if (interstitialRef.current) {
            const { AdEventType } = require('react-native-google-mobile-ads');
            interstitialRef.current.addAdEventListener(AdEventType.CLOSED, () => {
                setPdfModalVisible(true);
                interstitialRef.current = null;
            });
            interstitialRef.current.show();
        } else {
            setPdfModalVisible(true);
        }
    };

    const handlePdfComplete = async () => {
        if (!results) {
            setPdfModalVisible(false);
            return;
        }
        setPdfModalVisible(false);
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

            // Increment PDF count if not premium
            if (!isPremium) {
                const newCount = pdfExportsToday + 1;
                setPdfExportsToday(newCount);
                await AsyncStorage.setItem('@pdf_export_count', newCount.toString());
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
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

    const renderDivider = () => (
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
    );

    const ResultCardDesign = () => (
        <View style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%" preserveAspectRatio="none">
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Path d="M0,0 L1000,0 L1000,1000 L0,1000 Z" fill="url(#grad)" />
                {/* Abstract Curves */}
                <Path
                    d="M-50,80 Q150,20 350,80 T750,20"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="40"
                />
                <Path
                    d="M-50,120 Q200,60 400,120 T850,60"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="30"
                />
                <Path
                    d="M-50,160 Q250,100 450,160 T950,100"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="50"
                />
            </Svg>
        </View>
    );


    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.headerTextContent}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>EMI Calculator</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Smart Loan Planner</Text>
                </View>
                {isPremium ? (
                    <View style={[styles.badge, { backgroundColor: `${theme.primary}20`, position: 'absolute', right: 20, top: 12 }]}>
                        <Text style={[styles.badgeText, { color: theme.primary }]}>LIFETIME</Text>
                    </View>
                ) : (
                    <TouchableOpacity onPress={purchasePremium} style={[styles.badge, { backgroundColor: `${theme.primary}20`, position: 'absolute', right: 20, top: 12 }]}>
                        <Text style={[styles.badgeText, { color: theme.primary }]}>GO PRO</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
            >

                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                    <SliderInput
                        label="Loan Amount"
                        value={amount}
                        onChange={setAmount}
                        min={1000}
                        max={10000000}
                        step={1000}
                        prefix={currencySymbol}
                    />

                    <SliderInput
                        label="Interest Rate"
                        value={rate}
                        onChange={setRate}
                        min={1}
                        max={30}
                        step={0.1}
                        unit="%"
                    />

                    <View style={styles.tenureHeader}>
                        <Text style={[styles.label, { color: theme.textPrimary }]}>Tenure</Text>
                        <View style={[styles.toggleGroup, { backgroundColor: theme.background }]}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, tenureType === 'months' && { backgroundColor: theme.primary }]}
                                onPress={() => toggleTenureType('months')}
                            >
                                <Text style={[styles.toggleText, { color: tenureType === 'months' ? '#FFFFFF' : theme.textSecondary }]}>Months</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, tenureType === 'years' && { backgroundColor: theme.primary }]}
                                onPress={() => toggleTenureType('years')}
                            >
                                <Text style={[styles.toggleText, { color: tenureType === 'years' ? '#FFFFFF' : theme.textSecondary }]}>Years</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SliderInput
                        label=""
                        value={tenure}
                        onChange={handleTenureChange}
                        min={1}
                        max={tenureType === 'years' ? 30 : 360}
                        step={1}
                        unit={tenureType === 'years' ? ' Yrs' : ' Mo'}
                        compact
                    />

                    <View style={styles.typeContainer}>
                        <Text style={[styles.label, { color: theme.textPrimary }]}>Interest Type</Text>
                        <View style={styles.typeSelectors}>
                            <TouchableOpacity
                                style={[styles.typeBtn, { borderColor: loanType === 'reducing' ? theme.primary : theme.border, backgroundColor: loanType === 'reducing' ? `${theme.primary}10` : 'transparent' }]}
                                onPress={() => setLoanType('reducing')}
                            >
                                <Text style={[styles.typeText, { color: loanType === 'reducing' ? theme.primary : theme.textSecondary }]}>Reducing</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, { borderColor: loanType === 'flat' ? theme.primary : theme.border, backgroundColor: loanType === 'flat' ? `${theme.primary}10` : 'transparent' }]}
                                onPress={() => setLoanType('flat')}
                            >
                                <Text style={[styles.typeText, { color: loanType === 'flat' ? theme.primary : theme.textSecondary }]}>Flat Rate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {renderDivider()}

                    <TouchableOpacity
                        style={[styles.prepaymentToggle, { backgroundColor: theme.background }]}
                        onPress={() => setAddPrepayment(!addPrepayment)}
                    >
                        <Text style={[styles.prepaymentLabel, { color: theme.textPrimary }]}>Include Monthly Prepayment</Text>
                        <View style={[styles.toggleSwitch, { backgroundColor: addPrepayment ? theme.primary : theme.border }]}>
                            <View style={[styles.toggleCircle, addPrepayment && styles.toggleCircleActive]} />
                        </View>
                    </TouchableOpacity>

                    {addPrepayment && (
                        <Animated.View entering={FadeInDown} style={{ marginBottom: 12 }}>
                            <SliderInput
                                label="Extra Monthly Pay"
                                value={extraMonthly}
                                onChange={setExtraMonthly}
                                min={500}
                                max={100000}
                                step={500}
                                prefix={currencySymbol}
                                compact
                            />
                        </Animated.View>
                    )}

                    <TouchableOpacity
                        style={[styles.calculateBtn, { backgroundColor: theme.primary }, SHADOW.md]}
                        onPress={handleCalculate}
                    >
                        <Text style={styles.calculateBtnText}>Calculate EMI</Text>
                    </TouchableOpacity>
                </View>

                {results && (
                    <View
                        style={styles.resultsSection}
                        onLayout={(e: LayoutChangeEvent) => {
                            resultsRef.current = e.nativeEvent.layout.y;
                        }}
                    >
                        <Animated.View
                            entering={FadeInDown.duration(600).springify()}
                            style={[styles.resultBox, SHADOW.md]}
                        >
                            <ResultCardDesign />
                            <View style={[styles.cardContent, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                                <Text style={styles.resultLabel}>Monthly EMI</Text>
                                <Animated.Text style={[styles.resultAmount, glowStyle]}>
                                    {formatCurrency(results.emi, settings.currency)}
                                </Animated.Text>

                                <View style={styles.resultFooter}>
                                    <View style={styles.resultStat}>
                                        <Text style={styles.resultStatLabel}>Total Interest</Text>
                                        <Text style={styles.resultStatValue}>{formatCurrency(results.totalInterest, settings.currency)}</Text>
                                    </View>
                                    <View style={[styles.resultDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                                    <View style={styles.resultStat}>
                                        <Text style={styles.resultStatLabel}>Total Amount</Text>
                                        <Text style={styles.resultStatValue}>{formatCurrency(results.totalPayable, settings.currency)}</Text>
                                    </View>
                                    <View style={[styles.resultDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                                    <View style={styles.resultStat}>
                                        <Text style={styles.resultStatLabel}>End Date</Text>
                                        <Text style={styles.resultStatValue}>{results.endDate}</Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>

                        {results.savings && (
                            <Animated.View
                                entering={FadeInDown.delay(200).duration(600)}
                                style={[styles.savingsBanner, { backgroundColor: `${theme.income}15`, borderColor: theme.income }]}
                            >
                                <View style={styles.warningTextContent}>
                                    <Text style={[styles.warningTitle, { color: theme.income }]}>Interest Saved</Text>
                                    <Text style={[styles.warningDesc, { color: theme.textSecondary }]}>
                                        Save {formatCurrency(results.savings.interestSaved, settings.currency)} and close {results.savings.tenureSaved} months early!
                                    </Text>
                                </View>
                            </Animated.View>
                        )}

                        {!isPremium && (
                            <View style={{ marginVertical: 12 }}>
                                <BannerAdComponent isPremium={isPremium} />
                            </View>
                        )}

                        <Animated.View
                            entering={FadeInDown.delay(400).duration(600)}
                            style={[styles.chartBox, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}
                            onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                        >
                            {chartWidth > 0 && (
                                <DonutChart
                                    principal={amount}
                                    interest={results.totalInterest}
                                    currency={settings.currency}
                                    width={chartWidth}
                                />
                            )}
                        </Animated.View>

                        <Animated.View
                            entering={FadeInDown.delay(600).duration(600)}
                            style={styles.actionButtons}
                        >
                            <TouchableOpacity
                                style={[styles.actionBtn, { borderColor: theme.primary, borderWidth: 2 }]}
                                onPress={handleSave}
                            >
                                <Text style={[styles.actionBtnText, { color: theme.primary }]}>Save Loan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                                onPress={handleExportPDF}
                            >
                                <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>PDF Report</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                )}

            </ScrollView>

            <SaveSuccessModal
                visible={saveModalVisible}
                onClose={() => setSaveModalVisible(false)}
            />

            <PdfGenerationModal
                visible={pdfModalVisible}
                onComplete={handlePdfComplete}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        marginBottom: 8,
    },
    headerTextContent: {
        marginTop: 0,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerBrand: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
        fontWeight: '700',
        opacity: 0.8,
    },
    resultBox: {
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        backgroundColor: '#10B981', // Fallback Emerald
        padding: 24,
    },
    cardContent: {
        alignItems: 'center',
    },
    resultLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    resultAmount: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: '900',
        marginTop: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    resultFooter: {
        flexDirection: 'row',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        width: '100%',
    },
    resultStat: {
        flex: 1,
        alignItems: 'center',
    },
    resultStatLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    resultStatValue: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        marginTop: 4,
    },
    resultDivider: {
        width: 1,
        height: '100%',
    },
    inputContainer: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 16,
        opacity: 0.3,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
    },
    tenureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    toggleGroup: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    toggleBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '800',
    },
    typeContainer: {
        marginTop: 12,
        marginBottom: 24,
    },
    typeSelectors: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    typeText: {
        fontWeight: '700',
    },
    prepaymentToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: 16,
        borderRadius: 16,
    },
    prepaymentLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    toggleSwitch: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    toggleCircleActive: {
        transform: [{ translateX: 20 }],
    },
    calculateBtn: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    calculateBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    resultsSection: {
        marginTop: 24,
        marginBottom: 40,
    },
    savingsBanner: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    warningTextContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    warningDesc: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
    },
    chartBox: {
        borderRadius: 24,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        fontWeight: '800',
        fontSize: 16,
    },
});
