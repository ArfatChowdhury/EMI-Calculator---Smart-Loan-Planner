import { useEffect, useState } from 'react';
import Purchases, {
    LOG_LEVEL,
    PurchasesPackage,
} from 'react-native-purchases';

// TODO: Replace with your RevenueCat Android API key
const REVENUECAT_ANDROID_KEY = 'YOUR_REVENUECAT_ANDROID_KEY';

// This must match entitlement ID in RevenueCat dashboard
const ENTITLEMENT_ID = 'premium';

export function useSubscription() {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [offerings, setOfferings] = useState<any>(null);

    useEffect(() => {
        setupRevenueCat();
    }, []);

    const setupRevenueCat = async () => {
        try {
            if (__DEV__) {
                Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
            }
            await Purchases.configure({
                apiKey: REVENUECAT_ANDROID_KEY,
            });
            await checkSubscription();
            await fetchOfferings();
        } catch (e) {
            console.error('RevenueCat setup error:', e);
            setLoading(false);
        }
    };

    const checkSubscription = async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const isActive =
                typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
            setIsPremium(isActive);
        } catch (e) {
            console.error('Check subscription error:', e);
            setIsPremium(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchOfferings = async () => {
        try {
            const result = await Purchases.getOfferings();
            if (result.current) {
                setOfferings(result.current);
            }
        } catch (e) {
            console.error('Fetch offerings error:', e);
        }
    };

    const purchasePremium = async (): Promise<boolean> => {
        try {
            if (!offerings?.availablePackages?.length) {
                console.error('No packages available');
                return false;
            }
            const pkg: PurchasesPackage = offerings.availablePackages[0];
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            const isActive =
                typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
            setIsPremium(isActive);
            return isActive;
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error('Purchase failed:', e);
            }
            return false;
        }
    };

    const restorePurchases = async (): Promise<boolean> => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            const isActive =
                typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
            setIsPremium(isActive);
            return isActive;
        } catch (e) {
            console.error('Restore failed:', e);
            return false;
        }
    };

    return {
        isPremium,
        loading,
        offerings,
        purchasePremium,
        restorePurchases,
        checkSubscription,
    };
}
