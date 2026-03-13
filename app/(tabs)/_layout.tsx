import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import BannerAdComponent from '@/src/components/BannerAdComponent';
import { useSettings } from '@/src/hooks/useSettings';
import { useSubscription } from '@/src/hooks/useSubscription';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

export default function TabLayout() {
    const { settings } = useSettings();
    const { isPremium } = useSubscription();
    const theme = Colors[(settings.theme || 'light') as keyof typeof Colors];

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.textSecondary,
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.card,
                        borderTopColor: theme.border,
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
            <BannerAdComponent isPremium={isPremium} />
        </View>
    );
}
