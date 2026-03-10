import LimnerLogo from '@/src/components/LimnerLogo';
import { LoanProvider } from '@/src/context/LoanContext';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { useSubscription } from '@/src/hooks/useSubscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Linking, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function CustomSplashScreen({ onComplete }: { onComplete: () => void }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Minimum time to show your beautiful logo
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      }
    }
    prepare();
  }, [fadeAnim, onComplete]);

  return (
    <Animated.View style={[
      StyleSheet.absoluteFill,
      {
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        opacity: fadeAnim
      }
    ]}>
      <Image
        source={require('@/assets/images/splashicon.png')}
        style={{ width: 140, height: 140, resizeMode: 'contain' }}
      />
      <View style={{ position: 'absolute', bottom: 50, alignItems: 'center' }}>
        <LimnerLogo width={120} height={40} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
}

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
  const [appReady, setAppReady] = useState(false);

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

  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkRateUs = async () => {
      try {
        const hasRated = await AsyncStorage.getItem('has_rated_app');
        if (hasRated === 'true') return;

        const lastPrompt = await AsyncStorage.getItem('last_rate_prompt');
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000;

        // If prompted in the last 48 hours, don't prompt again yet
        if (lastPrompt && now - parseInt(lastPrompt) < fortyEightHours) {
          return;
        }

        // Wait 40 seconds before showing the prompt
        popupTimer.current = setTimeout(() => {
          Alert.alert(
            'Enjoying Limners?',
            'Your feedback helps us improve! Would you mind taking a moment to rate us on the Play Store?',
            [
              {
                text: 'Later',
                onPress: () => AsyncStorage.setItem('last_rate_prompt', now.toString()),
                style: 'cancel',
              },
              {
                text: 'Rate Now',
                onPress: () => {
                  AsyncStorage.setItem('has_rated_app', 'true');
                  // For Android Play Store URL - REPLACE WITH ACTUAL PACKAGE NAME ONCE PUBLISHED
                  Linking.openURL('market://details?id=com.naim.emicalculator').catch(() => {
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.naim.emicalculator');
                  });
                },
                style: 'default',
              },
            ],
            { cancelable: false }
          );
        }, 40000); // 40 seconds
      } catch (e) {
        console.warn('Rate us prompt error:', e);
      }
    };

    checkRateUs();

    return () => {
      if (popupTimer.current) {
        clearTimeout(popupTimer.current);
      }
    };
  }, []);

  return (
    <SettingsProvider>
      <LoanProvider>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />

          {!appReady && <CustomSplashScreen onComplete={() => setAppReady(true)} />}
        </View>
      </LoanProvider>
    </SettingsProvider>
  );
}
