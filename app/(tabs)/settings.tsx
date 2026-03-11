import { Colors, SHADOW } from '@/constants/Colors';
import { Currencies } from '@/constants/Currencies';
import BannerAdComponent from '@/src/components/BannerAdComponent';
import CompanyLogo from '@/src/components/CompanyLogo';
import { useLoanContext } from '@/src/context/LoanContext';
import { useSettings } from '@/src/hooks/useSettings';
import { useSubscription } from '@/src/hooks/useSubscription';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { settings, updateSettings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [loanTypeModalVisible, setLoanTypeModalVisible] = useState(false);
    const [tenureModalVisible, setTenureModalVisible] = useState(false);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [feedbackType, setFeedbackType] = useState('Suggestion');
    const [feedbackText, setFeedbackText] = useState('');

    const handleToggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
    };

    const handleSelectCurrency = (code: string) => {
        updateSettings({ currency: code });
        setCurrencyModalVisible(false);
    };

    const handleSelectLoanType = (type: string) => {
        updateSettings({ loanType: type });
        setLoanTypeModalVisible(false);
    };

    const handleSelectTenureUnit = (unit: string) => {
        updateSettings({ tenureUnit: unit });
        setTenureModalVisible(false);
    };

    const { isPremium, purchasePremium, restorePurchases, presentCustomerCenter } = useSubscription();

    const handlePurchase = async () => {
        const success = await purchasePremium();
        if (success) {
            Alert.alert('🎉 Welcome to Premium!', 'All ads have been removed.');
        } else {
            Alert.alert('Purchase Failed', 'Please try again.');
        }
    };

    const handleRestore = async () => {
        const success = await restorePurchases();
        if (success) {
            Alert.alert('✅ Restored!', 'Your premium access has been restored.');
        } else {
            Alert.alert('Nothing to Restore', 'No previous purchases found.');
        }
    };

    const handleSendFeedback = () => {
        if (!feedbackText.trim()) {
            Alert.alert('Empty Feedback', 'Please enter some details before sending.');
            return;
        }

        const email = 'limnersapp@gmail.com';
        const subject = `Limners App Feedback: ${feedbackType}`;
        const body = `${feedbackText}\n\n---\nPlatform: ${Platform.OS}\nVersion: 1.0.0`;
        const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.openURL(mailto).catch(err => {
            console.error('Error opening email client:', err);
            Alert.alert('Error', 'Could not open your email client. Please email limnersapp@gmail.com directly.');
        });

        setFeedbackModalVisible(false);
        setFeedbackText('');
    };

    const { clearAllData } = useLoanContext();

    const handleResetData = () => {
        Alert.alert(
            'Reset All Data',
            'Are you sure you want to clear all your saved loans and settings? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Reset', 
                    style: 'destructive', 
                    onPress: async () => {
                        const success = await clearAllData();
                        if (success) {
                            Alert.alert('Success', 'All your data has been cleared.');
                        } else {
                            Alert.alert('Error', 'Failed to clear data.');
                        }
                    } 
                }
            ]
        );
    };

    const handleOpenPrivacy = () => {
        Linking.openURL('https://limnersapp.web.app/emi-calculator/privacy').catch(err => {
            Alert.alert('Error', 'Could not open Privacy Policy link.');
        });
    };

    const handleOpenTerms = () => {
        Linking.openURL('https://limnersapp.web.app/emi-calculator/terms').catch(err => {
            Alert.alert('Error', 'Could not open Terms of Service link.');
        });
    };

    const renderItem = (icon: any, label: string, value: string, onPress: () => void, isLast = false) => (
        <TouchableOpacity
            style={[styles.item, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: settings.theme === 'dark' ? 'rgba(255,255,255,0.05)' : theme.background }]}>
                    <Ionicons name={icon} size={20} color={theme.primary} />
                </View>
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>{label}</Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={[styles.itemValue, { color: theme.textSecondary }]}>{value}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    const currentCurrency = Currencies.find(c => c.code === settings.currency) || Currencies[0];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>

                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferences</Text>
                <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                    {renderItem('cash-outline', 'Currency', `${currentCurrency.name}`, () => setCurrencyModalVisible(true))}
                    {renderItem('calculator-outline', 'Default Loan Type', settings.loanType === 'reducing' ? 'Reducing' : 'Flat', () => setLoanTypeModalVisible(true))}
                    {renderItem('calendar-outline', 'Tenure Unit', settings.tenureUnit === 'months' ? 'Months' : 'Years', () => setTenureModalVisible(true), true)}
                </View>

                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
                <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <View style={[styles.iconBox, { backgroundColor: settings.theme === 'dark' ? 'rgba(255,255,255,0.05)' : theme.background }]}>
                                <Ionicons name="moon-outline" size={20} color={theme.primary} />
                            </View>
                            <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={settings.theme === 'dark'}
                            onValueChange={handleToggleTheme}
                            trackColor={{ false: theme.border, true: theme.primary }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Premium</Text>
                {!isPremium ? (
                    <View style={[styles.premiumCard, { backgroundColor: theme.primary, borderColor: theme.primary }, SHADOW.md]}>
                        <View style={styles.premiumHeader}>
                            <Text style={styles.premiumTitle}>✨ Go Premium</Text>
                            <Text style={styles.premiumPrice}>$1.99 / month</Text>
                        </View>
                        <Text style={styles.premiumPerks}>
                            ✅ Remove all annoying ads{'\n'}
                            ✅ Unlimited PDF exports{'\n'}
                            ✅ Support the developer
                        </Text>
                        <TouchableOpacity
                            style={[styles.premiumBtn, { backgroundColor: '#FFFFFF' }]}
                            onPress={handlePurchase}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.premiumBtnText, { color: theme.primary }]}>Upgrade Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
                            <Text style={styles.restoreText}>Restore Purchase</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.premiumCard, { backgroundColor: '#059669', borderColor: '#059669' }, SHADOW.sm]}>
                        <Text style={styles.premiumTitle}>✨ Premium Active</Text>
                        <Text style={styles.premiumActiveSub}>All ads removed. Enjoy the experience!</Text>
                        <TouchableOpacity
                            style={[styles.premiumBtn, { backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 16 }]}
                            onPress={presentCustomerCenter}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.premiumBtnText, { color: '#FFFFFF' }]}>Manage Subscription</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Support & Legal</Text>
                <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                    {renderItem('chatbubble-ellipses-outline', 'Send Feedback', '', () => setFeedbackModalVisible(true))}
                    {renderItem('information-circle-outline', 'Version', '1.0.0', () => { })}
                    {renderItem('shield-checkmark-outline', 'Privacy Policy', '', handleOpenPrivacy)}
                    {renderItem('document-text-outline', 'Terms of Service', '', handleOpenTerms, true)}
                </View>

                <TouchableOpacity
                    style={[styles.resetBtn, { backgroundColor: `${theme.danger}15` }]}
                    onPress={handleResetData}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={20} color={theme.danger} style={{ marginRight: 8 }} />
                    <Text style={[styles.resetBtnText, { color: theme.danger }]}>Reset All Data</Text>
                </TouchableOpacity>

                <View style={[styles.footerBranding, { paddingBottom: 60 }]}>
                    <CompanyLogo
                        variant={settings.theme === 'dark' ? 'white' : 'black'}
                        width={300}
                        height={100}
                    />
                    <Text style={[styles.footerVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
                </View>
            </ScrollView>

            <View style={[styles.bottomAdContainer, { borderTopColor: theme.border }]}>
                <BannerAdComponent isPremium={isPremium} />
            </View>

            <Modal
                visible={currencyModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Currency</Text>
                            <TouchableOpacity onPress={() => setCurrencyModalVisible(false)} style={[styles.doneBtn, { backgroundColor: `${theme.primary}10` }]}>
                                <Text style={[styles.closeBtn, { color: theme.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={Currencies}
                            keyExtractor={(item) => item.code}
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.currencyItem, { borderBottomColor: theme.border }]}
                                    onPress={() => handleSelectCurrency(item.code)}
                                >
                                    <View style={styles.currencyInfo}>
                                        <View style={[styles.symbolCircle, { backgroundColor: theme.background }]}>
                                            <Text style={[styles.currencySymbol, { color: theme.primary }]}>{item.symbol}</Text>
                                        </View>
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={[styles.currencyName, { color: theme.textPrimary }]}>{item.name}</Text>
                                            <Text style={[styles.currencyCode, { color: theme.textSecondary }]}>{item.code}</Text>
                                        </View>
                                    </View>
                                    {settings.currency === item.code && (
                                        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Loan Type Modal */}
            <Modal
                visible={loanTypeModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setLoanTypeModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Default Loan Type</Text>
                            <TouchableOpacity onPress={() => setLoanTypeModalVisible(false)} style={[styles.doneBtn, { backgroundColor: `${theme.primary}10` }]}>
                                <Text style={[styles.closeBtn, { color: theme.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 20 }}>
                            {['reducing', 'flat'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.currencyItem, { borderBottomColor: theme.border }]}
                                    onPress={() => handleSelectLoanType(type)}
                                >
                                    <Text style={[styles.currencyName, { color: theme.textPrimary, textTransform: 'capitalize' }]}>{type}</Text>
                                    {settings.loanType === type && (
                                        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Tenure Unit Modal */}
            <Modal
                visible={tenureModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setTenureModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Default Tenure Unit</Text>
                            <TouchableOpacity onPress={() => setTenureModalVisible(false)} style={[styles.doneBtn, { backgroundColor: `${theme.primary}10` }]}>
                                <Text style={[styles.closeBtn, { color: theme.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 20 }}>
                            {['months', 'years'].map((unit) => (
                                <TouchableOpacity
                                    key={unit}
                                    style={[styles.currencyItem, { borderBottomColor: theme.border }]}
                                    onPress={() => handleSelectTenureUnit(unit)}
                                >
                                    <Text style={[styles.currencyName, { color: theme.textPrimary, textTransform: 'capitalize' }]}>{unit}</Text>
                                    {settings.tenureUnit === unit && (
                                        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                visible={feedbackModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFeedbackModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card, padding: 24 }]}>
                        <View style={[styles.modalHeader, { padding: 0, paddingBottom: 16, borderBottomWidth: 0 }]}>
                            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Send Feedback</Text>
                            <TouchableOpacity onPress={() => setFeedbackModalVisible(false)} style={[styles.doneBtn, { backgroundColor: theme.background }]}>
                                <Ionicons name="close" size={20} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.feedbackTypeSelector}>
                            {['Suggestion', 'Bug Report', 'Question'].map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeChip,
                                        { backgroundColor: feedbackType === type ? theme.primary : theme.background }
                                    ]}
                                    onPress={() => setFeedbackType(type)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[
                                        styles.typeChipText,
                                        { color: feedbackType === type ? '#FFFFFF' : theme.textPrimary }
                                    ]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={[
                                styles.feedbackInput,
                                {
                                    backgroundColor: theme.background,
                                    color: theme.textPrimary,
                                    borderColor: theme.border
                                }
                            ]}
                            placeholder="Tell us what you think or report a problem..."
                            placeholderTextColor={theme.textSecondary}
                            multiline
                            textAlignVertical="top"
                            value={feedbackText}
                            onChangeText={setFeedbackText}
                        />

                        <TouchableOpacity
                            style={[styles.sendFeedbackBtn, { backgroundColor: theme.primary }]}
                            onPress={handleSendFeedback}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.sendFeedbackBtnText}>Send to Developer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    bottomAdContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
        paddingVertical: 4,
        borderTopWidth: 0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    settingsCard: {
        borderRadius: 24,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemValue: {
        fontSize: 14,
        fontWeight: '700',
        marginRight: 8,
    },
    resetBtn: {
        marginTop: 12,
        padding: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 20,
    },
    resetBtnText: {
        fontWeight: '800',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '85%',
        paddingBottom: 40,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    doneBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    closeBtn: {
        fontSize: 15,
        fontWeight: '800',
    },
    currencyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencyName: {
        fontSize: 16,
        fontWeight: '800',
    },
    currencyCode: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    symbolCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '900',
    },
    // Premium Styles
    premiumCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
    },
    premiumHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    premiumTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    premiumPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.9)',
    },
    premiumPerks: {
        fontSize: 14,
        lineHeight: 22,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 24,
        fontWeight: '600',
    },
    premiumBtn: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    premiumBtnText: {
        fontWeight: '800',
        fontSize: 16,
    },
    restoreBtn: {
        alignItems: 'center',
    },
    restoreText: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        textDecorationLine: 'underline',
    },
    premiumActiveSub: {
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: 8,
        fontWeight: '600',
    },
    // Feedback Styles
    feedbackTypeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    typeChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    typeChipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    feedbackInput: {
        height: 120,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        marginBottom: 20,
    },
    sendFeedbackBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
    },
    sendFeedbackBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    footerBranding: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        opacity: 0.6,
    },
    footerVersion: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
    },
});
