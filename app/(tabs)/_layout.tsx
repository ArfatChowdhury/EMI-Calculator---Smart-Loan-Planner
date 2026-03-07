import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AdUnits } from '@/src/constants/adUnits';
import { useSettings } from '@/src/hooks/useSettings';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const interstitial = InterstitialAd.createForAdRequest(AdUnits.interstitial || TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    const showInterstitialOnLaunch = async () => {
      const now = Date.now();
      const lastShown = settings.lastInterstitialShown || 0;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - lastShown > twentyFourHours) {
        const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          interstitial.show();
          updateSettings({ lastInterstitialShown: now });
        });

        interstitial.load();
        return unsubscribe;
      }
    };

    showInterstitialOnLaunch();
  }, [settings.lastInterstitialShown]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.card,
            borderTopColor: Colors.border,
            paddingBottom: Platform.OS === 'ios' ? 20 : 0,
            height: Platform.OS === 'ios' ? 88 : 60,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calculator',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calculator.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="my-loans"
          options={{
            title: 'My Loans',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="compare"
          options={{
            title: 'Compare',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>

      <View style={{
        width: '100%',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0
      }}>
        <BannerAd
          unitId={AdUnits.banner || TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </View>
  );
}
