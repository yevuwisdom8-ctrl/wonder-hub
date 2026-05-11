import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Today</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="results">
        <Icon sf={{ default: "trophy", selected: "trophy.fill" }} />
        <Label>Results</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="archive">
        <Icon sf={{ default: "list.bullet", selected: "list.bullet" }} />
        <Label>Archive</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="subscribe">
        <Icon sf={{ default: "envelope", selected: "envelope.fill" }} />
        <Label>Subscribe</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : undefined,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios" ? (
              <SymbolView name="house" tintColor={color} size={24} />
            ) : (
              <Ionicons name="home-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Results",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios" ? (
              <SymbolView name="trophy" tintColor={color} size={24} />
            ) : (
              <Ionicons name="trophy-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: "Archive",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios" ? (
              <SymbolView name="list.bullet" tintColor={color} size={24} />
            ) : (
              <Ionicons name="list-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="subscribe"
        options={{
          title: "Subscribe",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios" ? (
              <SymbolView name="envelope" tintColor={color} size={24} />
            ) : (
              <Ionicons name="mail-outline" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
