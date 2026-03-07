import { Platform } from 'react-native';

/**
 * AdMob Test IDs
 * TODO: Replace with real Ad Unit IDs from AdMob Console before Play Store release
 */
export const AdUnits = {
    banner: Platform.select({
        ios: 'ca-app-pub-3940256099942544/2934735716',
        android: 'ca-app-pub-3940256099942544/6300978111',
    }),
    interstitial: Platform.select({
        ios: 'ca-app-pub-3940256099942544/4411468910',
        android: 'ca-app-pub-3940256099942544/1033173712',
    }),
    native: Platform.select({
        ios: 'ca-app-pub-3940256099942544/3986624511',
        android: 'ca-app-pub-3940256099942544/2247696110',
    }),
};
