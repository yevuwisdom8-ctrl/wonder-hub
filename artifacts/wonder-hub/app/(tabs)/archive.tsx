import { Ionicons } from "@expo/vector-icons";
import { useListTips, getListTipsQueryKey } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TipCard } from "@/components/TipCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useColors } from "@/hooks/useColors";

const SPORTS = ["All", "Football", "Basketball", "Tennis", "Cricket", "Baseball", "Hockey"];
const STATUSES = ["All", "pending", "won", "lost", "void"] as const;
type FilterStatus = (typeof STATUSES)[number];

export default function ArchiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [sport, setSport] = useState("All");
  const [status, setStatus] = useState<FilterStatus>("All");

  const params = {
    ...(sport !== "All" ? { sport } : {}),
    ...(status !== "All" ? { status } : {}),
  };

  const query = useListTips(params, { query: { queryKey: getListTipsQueryKey(params) } });
  const tips = query.data ?? [];
  const isLoading = query.isLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={isLoading ? (Array(4).fill(null) as null[]) : tips}
        keyExtractor={(item, i) => (item ? String(item.id) : `skeleton-${i}`)}
        renderItem={({ item }) =>
          item ? <TipCard tip={item} /> : <SkeletonCard />
        }
        scrollEnabled={!!(tips.length > 0 || isLoading)}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 12, paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Archive</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {tips.length} tip{tips.length !== 1 ? "s" : ""}
            </Text>

            {/* Sport filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {SPORTS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={sport === s}
                  onPress={() => setSport(s)}
                  colors={colors}
                />
              ))}
            </ScrollView>

            {/* Status filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {STATUSES.map((s) => (
                <Chip
                  key={s}
                  label={s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                  active={status === s}
                  onPress={() => setStatus(s)}
                  colors={colors}
                  statusColor={s !== "All" ? getStatusColor(s, colors) : undefined}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No tips found</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Try adjusting your filters
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !isLoading}
            onRefresh={() => query.refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  colors,
  statusColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  statusColor?: string;
}) {
  const activeColor = statusColor ?? colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? activeColor + "18" : colors.card,
          borderColor: active ? activeColor : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? activeColor : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getStatusColor(status: string, colors: ReturnType<typeof useColors>): string {
  if (status === "won") return colors.won;
  if (status === "lost") return colors.lost;
  if (status === "pending") return colors.pending;
  return colors.void;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: { marginBottom: 8, gap: 10 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  chips: { gap: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
});
