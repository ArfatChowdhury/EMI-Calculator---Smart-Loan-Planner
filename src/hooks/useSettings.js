import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const SETTINGS_STORAGE_KEY = '@app_settings';

const DEFAULT_SETTINGS = {
    currency: 'BDT',
    loanType: 'reducing',
    tenureUnit: 'months',
    theme: 'dark',
    lastInterstitialShown: 0,
};

export const useSettings = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            const updated = { ...settings, ...newSettings };
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
            setSettings(updated);
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    return {
        settings,
        loading,
        updateSettings,
    };
};
