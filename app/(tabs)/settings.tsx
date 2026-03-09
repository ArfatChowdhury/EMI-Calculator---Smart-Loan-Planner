import { Colors, SHADOW } from '@/constants/Colors';
import { Currencies } from '@/constants/Currencies';
import { useSettings } from '@/src/hooks/useSettings';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { settings, updateSettings } = useSettings();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    const handleToggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
    };

    const handleSelectCurrency = (code: string) => {
        updateSettings({ currency: code });
        setCurrencyModalVisible(false);
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
                    {renderItem('calculator-outline', 'Default Loan Type', settings.loanType === 'reducing' ? 'Reducing' : 'Flat', () => { })}
                    {renderItem('calendar-outline', 'Tenure Unit', settings.tenureUnit === 'months' ? 'Months' : 'Years', () => { }, true)}
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

                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Support & Legal</Text>
                <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOW.sm]}>
                    {renderItem('information-circle-outline', 'Version', '1.0.0', () => { })}
                    {renderItem('shield-checkmark-outline', 'Privacy Policy', '', () => { })}
                    {renderItem('document-text-outline', 'Terms of Service', '', () => { }, true)}
                </View>

                <TouchableOpacity style={[styles.resetBtn, { backgroundColor: `${theme.expense}10` }]} activeOpacity={0.7} onPress={() => Alert.alert('Reset', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Reset', style: 'destructive' }])}>
                    <Ionicons name="trash-outline" size={20} color={theme.expense} style={{ marginRight: 8 }} />
                    <Text style={[styles.resetBtnText, { color: theme.expense }]}>Reset All Data</Text>
                </TouchableOpacity>
            </ScrollView>

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
});
