import { Ionicons } from "@expo/vector-icons";
import { useGetStats, useGetTodaysTips, getGetTodaysTipsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import React from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonCard } from "@/components/SkeletonCard";
import { TipCard } from "@/components/TipCard";
import { useColors } from "@/hooks/useColors";

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const tipsQuery = useGetTodaysTips({ query: { queryKey: getGetTodaysTipsQueryKey() } });
  const statsQuery = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });

  const tips = tipsQuery.data ?? [];
  const stats = statsQuery.data;
  const isLoading = tipsQuery.isLoading;
  const isRefreshing = tipsQuery.isFetching && !tipsQuery.isLoading;

  const onRefresh = () => {
    tipsQuery.refetch();
    statsQuery.refetch();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={isLoading ? (Array(3).fill(null) as null[]) : tips}
        keyExtractor={(item, i) => (item ? String(item.id) : `skeleton-${i}`)}
        renderItem={({ item }) =>
          item ? <TipCard tip={item} /> : <SkeletonCard />
        }
        scrollEnabled={tips.length > 0 || isLoading}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 12, paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Title */}
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.appName, { color: colors.primary }]}>Wonder Hub</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  {getTodayLabel()}
                </Text>
              </View>
              <View style={[styles.liveChip, { borderColor: colors.won + "44", backgroundColor: colors.won + "11" }]}>
                <View style={[styles.liveDot, { backgroundColor: colors.won }]} />
                <Text style={[styles.liveText, { color: colors.won }]}>LIVE</Text>
              </View>
            </View>

            {/* Stats row */}
            {stats && (
              <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <StatPill label="WIN RATE" value={`${stats.winRate.toFixed(1)}%`} color={colors.won} colors={colors} />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <StatPill label="WON" value={String(stats.won)} color={colors.won} colors={colors} />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <StatPill label="LOST" value={String(stats.lost)} color={colors.lost} colors={colors} />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <StatPill label="TOTAL" value={String(stats.total)} color={colors.primary} colors={colors} />
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {tips.length > 0 || isLoading
                ? `Today's Picks`
                : ""}
            </Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No picks today</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Check back later — picks are posted daily
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function StatPill({ label, value, color, colors }: { label: string; value: string; color: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function getTodayLabel() {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: { gap: 14, marginBottom: 4 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-around",
  },
  statPill: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.6 },
  divider: { width: 1, marginVertical: 4 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
});
