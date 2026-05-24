import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { APP_COLORS } from '../constants/colors';
import PomodoroScreen from '../screens/PomodoroScreen';
import LibraryScreen from '../screens/LibraryScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Pomodoro"
          component={PomodoroScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="⏱" label="Zamanlayıcı" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📚" label="Kütüphane" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📊" label="İstatistik" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="⚙️" label="Ayarlar" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: APP_COLORS.tabBar,
    borderTopColor: APP_COLORS.tabBarBorder,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: APP_COLORS.primary + '18',
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: APP_COLORS.primary,
  },
});
