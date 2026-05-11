import { Ionicons } from "@expo/vector-icons";
import { useGetRecentResults, getGetRecentResultsQueryKey } from "@workspace/api-client-react";
import React from "react";
import { FlatList, Platform, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TipCard } from "@/components/TipCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useColors } from "@/hooks/useColors";

export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const query = useGetRecentResults(
    { limit: 30 },
    { query: { queryKey: getGetRecentResultsQueryKey({ limit: 30 }) } }
  );
  const results = query.data ?? [];
  const isLoading = query.isLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={isLoading ? (Array(4).fill(null) as null[]) : results}
        keyExtractor={(item, i) => (item ? String(item.id) : `skeleton-${i}`)}
        renderItem={({ item }) =>
          item ? <TipCard tip={item} /> : <SkeletonCard />
        }
        scrollEnabled={!!(results.length > 0 || isLoading)}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 12, paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Results</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Recent wins & losses
            </Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Results appear here once picks are settled
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: { marginBottom: 8, gap: 4 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
});
