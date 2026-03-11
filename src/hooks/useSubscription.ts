import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

// RevenueCat API Keys
const REVENUECAT_KEYS = {
    android: 'goog_kcoZDmRPmsEDxduYPCboojqqXeN',
    ios: 'appl_placeholder', // Add your iOS key here when ready
};

const REVENUECAT_API_KEY = Platform.select({
    android: REVENUECAT_KEYS.android,
    ios: REVENUECAT_KEYS.ios,
}) || REVENUECAT_KEYS.android;

// This must match entitlement ID in RevenueCat dashboard
const ENTITLEMENT_ID = 'Limners Pro';

export function useSubscription() {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

    useEffect(() => {
        setupRevenueCat();

        // Listen for external purchase changes
        const listener = (info: CustomerInfo) => {
            updateCustomerInformation(info);
        };

        Purchases.addCustomerInfoUpdateListener(listener);

        return () => {
            Purchases.removeCustomerInfoUpdateListener(listener);
        };
    }, []);

    const updateCustomerInformation = async (info?: CustomerInfo) => {
        try {
            const latestInfo = info || await Purchases.getCustomerInfo();
            setCustomerInfo(latestInfo);

            const isActive = typeof latestInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
            setIsPremium(isActive);
        } catch (error) {
            console.error('Failed to get customer info:', error);
            setIsPremium(false);
        } finally {
            setLoading(false);
        }
    };

    const setupRevenueCat = async () => {
        try {
            if (__DEV__) {
                Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
            }
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
            }
            await updateCustomerInformation();
        } catch (e) {
            console.error('RevenueCat setup error:', e);
            setLoading(false);
        }
    };

    const checkSubscription = async () => {
        await updateCustomerInformation();
    };

    // Keep purchasePremium for backwards UI compatibility but route it to presentPaywall
    const purchasePremium = async (): Promise<boolean> => {
        try {
            const paywallResult = await RevenueCatUI.presentPaywall();

            switch (paywallResult) {
                case PAYWALL_RESULT.PURCHASED:
                case PAYWALL_RESULT.RESTORED:
                    await updateCustomerInformation();
                    return true;
                case PAYWALL_RESULT.CANCELLED:
                case PAYWALL_RESULT.ERROR:
                    return false;
            }
        } catch (error) {
            console.error('Error presenting Paywall:', error);
            return false;
        }
        return false;
    };

    const presentCustomerCenter = async () => {
        try {
            await RevenueCatUI.presentCustomerCenter();
        } catch (error) {
            console.error('Error presenting Customer Center:', error);
        }
    };

    const restorePurchases = async (): Promise<boolean> => {
        try {
            const restoredInfo = await Purchases.restorePurchases();
            await updateCustomerInformation(restoredInfo);
            const isActive = typeof restoredInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
            return isActive;
        } catch (e) {
            console.error('Restore failed:', e);
            return false;
        }
    };

    return {
        isPremium,
        loading,
        customerInfo,
        purchasePremium,      // Aliased to presentPaywall for backwards compatibility
        presentPaywall: purchasePremium, // Also export explicitly
        presentCustomerCenter,
        restorePurchases,
        checkSubscription,
    };
}
