import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { StatusBadge } from "./StatusBadge";

interface Tip {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  tipText: string;
  odds: number;
  confidence: number | null;
  status: "pending" | "won" | "lost" | "void";
  matchDate: string;
  notes?: string | null;
}

interface TipCardProps {
  tip: Tip;
}

const SPORT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Football: "football",
  Basketball: "basketball",
  Tennis: "tennisball",
  Cricket: "baseball",
  Baseball: "baseball",
  Hockey: "snow",
};

export function TipCard({ tip }: TipCardProps) {
  const colors = useColors();
  const icon = SPORT_ICONS[tip.sport] ?? "trophy";

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.sportRow}>
          <View style={[styles.sportIcon, { backgroundColor: colors.primary + "18" }]}>
            <Ionicons name={icon} size={14} color={colors.primary} />
          </View>
          <Text style={[styles.sport, { color: colors.mutedForeground }]}>
            {tip.sport.toUpperCase()}
          </Text>
          <Text style={[styles.dot, { color: colors.border }]}>·</Text>
          <Text style={[styles.league, { color: colors.mutedForeground }]} numberOfLines={1}>
            {tip.league}
          </Text>
        </View>
        <StatusBadge status={tip.status} size="sm" />
      </View>

      {/* Match */}
      <Text style={[styles.match, { color: colors.foreground }]}>
        {tip.homeTeam} <Text style={{ color: colors.mutedForeground }}>vs</Text> {tip.awayTeam}
      </Text>

      {/* Pick row */}
      <View style={[styles.pickRow, { backgroundColor: colors.secondary }]}>
        <View style={styles.pickLeft}>
          <Text style={[styles.pickLabel, { color: colors.mutedForeground }]}>THE PICK</Text>
          <Text style={[styles.pickText, { color: colors.foreground }]}>{tip.tipText}</Text>
        </View>
        <View style={styles.oddsBlock}>
          <Text style={[styles.oddsLabel, { color: colors.mutedForeground }]}>ODDS</Text>
          <Text style={[styles.odds, { color: colors.primary }]}>{tip.odds.toFixed(2)}</Text>
        </View>
      </View>

      {/* Confidence & date */}
      <View style={styles.footer}>
        {tip.confidence != null && (
          <View style={styles.confidence}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    backgroundColor:
                      i <= tip.confidence! ? colors.primary : colors.border,
                    height: 3 + i * 2,
                  },
                ]}
              />
            ))}
          </View>
        )}
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {formatDate(tip.matchDate)}
        </Text>
      </View>

      {tip.notes ? (
        <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={2}>
          {tip.notes}
        </Text>
      ) : null}
    </View>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  sportIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  sport: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.6,
  },
  dot: {
    fontSize: 14,
  },
  league: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  match: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 22,
  },
  pickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    padding: 12,
  },
  pickLeft: {
    flex: 1,
    gap: 2,
  },
  pickLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  pickText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  oddsBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  oddsLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  odds: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  confidence: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  notes: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 17,
  },
});
