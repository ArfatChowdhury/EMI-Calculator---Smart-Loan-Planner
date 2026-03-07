import { Colors } from '@/constants/Colors';
import { useSettings } from '@/src/hooks/useSettings';
import React from 'react';
import {
    Alert,
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

    const handleToggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
        Alert.alert('Theme Updated', `App theme set to ${newTheme} mode.`);
    };

    const renderSection = (title: string, children: React.ReactNode) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );

    const renderItem = (label: string, value: string, onPress: () => void) => (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <Text style={styles.itemLabel}>{label}</Text>
            <Text style={styles.itemValue}>{value}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Settings</Text>

                {renderSection('Preferences', (
                    <>
                        {renderItem('Currency', settings.currency, () => { })}
                        {renderItem('Default Loan Type', settings.loanType === 'reducing' ? 'Reducing Balance' : 'Flat Rate', () => { })}
                        {renderItem('Tenure Unit', settings.tenureUnit === 'months' ? 'Months' : 'Years', () => { })}

                        <View style={styles.item}>
                            <Text style={styles.itemLabel}>Dark Mode</Text>
                            <Switch
                                value={settings.theme === 'dark'}
                                onValueChange={handleToggleTheme}
                                trackColor={{ false: Colors.border, true: Colors.primary }}
                                thumbColor={Colors.white}
                            />
                        </View>
                    </>
                ))}

                {renderSection('About', (
                    <>
                        {renderItem('Version', '1.0.0', () => { })}
                        {renderItem('Privacy Policy', 'View', () => { })}
                        {renderItem('Terms of Service', 'View', () => { })}
                    </>
                ))}

                <TouchableOpacity style={styles.resetBtn}>
                    <Text style={styles.resetBtnText}>Reset All Data</Text>
                </TouchableOpacity>
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionContent: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    itemLabel: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
    itemValue: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    resetBtn: {
        marginTop: 12,
        padding: 16,
        alignItems: 'center',
    },
    resetBtnText: {
        color: '#FF5252',
        fontWeight: '600',
        fontSize: 16,
    },
});
