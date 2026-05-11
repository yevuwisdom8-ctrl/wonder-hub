import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type Status = "pending" | "won" | "lost" | "void";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const colors = useColors();

  const colorMap: Record<Status, { bg: string; text: string; label: string }> = {
    pending: { bg: colors.pending + "22", text: colors.pending, label: "PENDING" },
    won: { bg: colors.won + "22", text: colors.won, label: "WON" },
    lost: { bg: colors.lost + "22", text: colors.lost, label: "LOST" },
    void: { bg: colors.void + "22", text: colors.void, label: "VOID" },
  };

  const config = colorMap[status] ?? colorMap.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === "sm" && styles.sm]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }, size === "sm" && styles.smText]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  smText: {
    fontSize: 10,
  },
});
