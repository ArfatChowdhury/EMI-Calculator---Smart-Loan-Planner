import { LoanProvider } from '@/src/context/LoanContext';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { useSubscription } from '@/src/hooks/useSubscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Initialize AdMob in production only
if (!__DEV__) {
  try {
    const MobileAds =
      require('react-native-google-mobile-ads').default;
    MobileAds().initialize().then(() => {
      console.log('AdMob initialized successfully');
    });
  } catch (e) {
    console.warn('AdMob initialization failed:', e);
  }
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { isPremium } = useSubscription();

  const showLaunchInterstitial = async (isPremium: boolean) => {
    // Skip in dev mode or for premium users
    if (__DEV__ || isPremium) return;

    try {
      const {
        InterstitialAd,
        AdEventType,
      } = require('react-native-google-mobile-ads');
      const { AdUnits } = require('@/src/constants/adUnits');

      // Check if shown in last 24 hours
      const lastShown = await AsyncStorage.getItem('last_interstitial');
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (lastShown && now - parseInt(lastShown) < twentyFourHours) {
        return; // Already shown today, skip
      }

      const interstitial = InterstitialAd.createForAdRequest(
        AdUnits.interstitial,
        { requestNonPersonalizedAdsOnly: true }
      );

      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show();
        AsyncStorage.setItem('last_interstitial', now.toString());
      });

      interstitial.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.warn('Launch interstitial failed:', error);
        }
      );

      interstitial.load();
    } catch (e) {
      console.warn('Interstitial error:', e);
    }
  };

  // Call inside useEffect in root component:
  useEffect(() => {
    showLaunchInterstitial(isPremium);
  }, [isPremium]);

  return (
    <SettingsProvider>
      <LoanProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </LoanProvider>
    </SettingsProvider>
  );
}
