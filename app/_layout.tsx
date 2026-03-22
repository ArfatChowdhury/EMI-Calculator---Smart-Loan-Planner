import CompanyLogo from '@/src/components/CompanyLogo';
import RateUsModal from '@/src/components/RateUsModal';
import { LoanProvider } from '@/src/context/LoanContext';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { useSubscription } from '@/src/hooks/useSubscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text as RNText, View } from 'react-native';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function CustomSplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0: Icon, 1: Animation
  const iconFade = useRef(new Animated.Value(1)).current;
  const animFade = useRef(new Animated.Value(0.01)).current;
  const containerFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function sequence() {
      try {
        // Phase 1: Show static icon for 800ms
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Transition to Phase 2: Fade in animation below icon
        Animated.timing(animFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setPhase(1));

        // Let the animation play for 2000ms
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Hide native splash screen if not already
        await SplashScreen.hideAsync();

        // Final transition: Fade out the whole custom splash
        Animated.timing(containerFade, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      } catch (e) {
        console.warn('Splash sequence error:', e);
        onComplete();
      }
    }
    sequence();
  }, [iconFade, animFade, containerFade, onComplete]);

  return (
    <Animated.View style={[
      StyleSheet.absoluteFill,
      {
        backgroundColor: '#0F172A', // Deep dark background for premium feel
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9991, // Ensure it's above everything
        opacity: containerFade
      }
    ]}>
      {/* Phase 0: Icon */}
      <Animated.View style={{ 
        position: 'absolute',
        opacity: iconFade,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={{ width: 160, height: 160, borderRadius: 32 }}
        />
      </Animated.View>

      {/* Phase 1: Animation */}
      <Animated.View style={{ 
        position: 'absolute',
        top: '50%',
        marginTop: 90,
        opacity: animFade,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CompanyLogo width={240} height={70} variant="white" />
      </Animated.View>
    </Animated.View>
  );
}

function OTAUpdateHandler() {
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // Force reload to apply update silently if possible or on next launch
          // Since user wants "auto update", we can reload if they just opened the app
          await Updates.reloadAsync();
        }
      } catch (error) {
        // Silent error for OTA
      }
    }

    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  return null;
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

  const interstitialRef = useRef<any>(null);

  const preloadLaunchInterstitial = async (isPremium: boolean) => {
    // Skip in dev mode or for premium users
    if (__DEV__ || isPremium) return;

    try {
      const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');
      const { AdUnits } = require('@/src/constants/adUnits');

      /* 
      // Check if shown in last 24 hours (Commented out for max revenue)
      const lastShown = await AsyncStorage.getItem('last_interstitial');
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (lastShown && now - parseInt(lastShown) < twentyFourHours) {
        return; // Already shown today, skip
      }
      */

      const interstitial = InterstitialAd.createForAdRequest(
        AdUnits.interstitial,
        { requestNonPersonalizedAdsOnly: true }
      );

      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitialRef.current = interstitial;
      });

      interstitial.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.warn('Launch interstitial failed:', error);
        }
      );

      interstitial.load();
    } catch (e) {
      console.warn('Interstitial preload error:', e);
    }
  };

  const showPreloadedInterstitial = async () => {
    if (interstitialRef.current) {
      try {
        interstitialRef.current.show();
        await AsyncStorage.setItem('last_interstitial', Date.now().toString());
        interstitialRef.current = null;
      } catch (e) {
        console.warn('Error showing preloaded interstitial:', e);
      }
    }
  };

  // Preload on mount or when premium status changes
  useEffect(() => {
    preloadLaunchInterstitial(isPremium);
  }, [isPremium]);

  // Show ad slightly after app is ready and splash is gone
  useEffect(() => {
    if (appReady && !isPremium) {
      const timer = setTimeout(() => {
        showPreloadedInterstitial();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [appReady, isPremium]);

  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rateModalVisible, setRateModalVisible] = useState(false);

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

        // Wait 45 seconds before showing the prompt
        popupTimer.current = setTimeout(() => {
          setRateModalVisible(true);
        }, 45000);
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
        <View style={{ flex: 1, backgroundColor: '#121212' }}>
          <OTAUpdateHandler />
          {appReady ? (
            <>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="light" />
            </>
          ) : (
            <CustomSplashScreen onComplete={() => setAppReady(true)} />
          )}

          <RateUsModal
            visible={rateModalVisible}
            onClose={() => setRateModalVisible(false)}
          />
        </View>
      </LoanProvider>
    </SettingsProvider>
  );
}
