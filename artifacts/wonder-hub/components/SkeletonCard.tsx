import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function SkeletonBox({ width, height, style }: { width?: number | string; height: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const colors = useColors();
  return (
    <Animated.View
      style={[
        { width: width ?? "100%", height, borderRadius: 8, backgroundColor: colors.border, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <SkeletonBox width={60} height={12} />
        <SkeletonBox width={60} height={22} style={{ borderRadius: 20 }} />
      </View>
      <SkeletonBox height={18} />
      <SkeletonBox height={56} style={{ borderRadius: 10 }} />
      <View style={styles.row}>
        <SkeletonBox width={80} height={12} />
        <SkeletonBox width={60} height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
