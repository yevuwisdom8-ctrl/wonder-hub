import { Ionicons } from "@expo/vector-icons";
import { useSubscribe } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function SubscribeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useSubscribe();

  const handleSubscribe = () => {
    setErrorMsg("");
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    mutation.mutate(
      { data: { email: trimmed, name: name.trim() || undefined } },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setSuccess(true);
          setEmail("");
          setName("");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            "Something went wrong. Try again.";
          setErrorMsg(msg);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      }
    );
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 12, paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 },
      ]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.hero}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
          <Ionicons name="mail" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Daily Picks</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Get today's predictions delivered to your inbox every morning before kick-off.
        </Text>
      </View>

      {/* Perks */}
      <View style={[styles.perks, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { icon: "flash" as const, text: "Tips delivered before matches start" },
          { icon: "bar-chart" as const, text: "Win rate & stats included" },
          { icon: "lock-closed" as const, text: "No spam — unsubscribe anytime" },
        ].map((p) => (
          <View key={p.text} style={styles.perk}>
            <View style={[styles.perkIcon, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name={p.icon} size={16} color={colors.primary} />
            </View>
            <Text style={[styles.perkText, { color: colors.foreground }]}>{p.text}</Text>
          </View>
        ))}
      </View>

      {success ? (
        <View style={[styles.successBox, { backgroundColor: colors.won + "14", borderColor: colors.won + "44" }]}>
          <Ionicons name="checkmark-circle" size={32} color={colors.won} />
          <Text style={[styles.successTitle, { color: colors.won }]}>You're subscribed!</Text>
          <Text style={[styles.successText, { color: colors.mutedForeground }]}>
            You'll get today's picks in your inbox tomorrow morning.
          </Text>
          <Pressable onPress={() => setSuccess(false)} style={styles.resetBtn}>
            <Text style={[styles.resetText, { color: colors.mutedForeground }]}>Subscribe another email</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>EMAIL ADDRESS *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>NAME (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSubscribe}
            />
          </View>

          {errorMsg ? (
            <View style={[styles.errorBox, { backgroundColor: colors.lost + "14", borderColor: colors.lost + "44" }]}>
              <Ionicons name="alert-circle" size={16} color={colors.lost} />
              <Text style={[styles.errorText, { color: colors.lost }]}>{errorMsg}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSubscribe}
            disabled={mutation.isPending}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, opacity: pressed || mutation.isPending ? 0.75 : 1 },
            ]}
          >
            {mutation.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Subscribe for Free</Text>
            )}
          </Pressable>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 20 },
  hero: { alignItems: "center", gap: 12, paddingTop: 16 },
  iconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, paddingHorizontal: 12 },
  perks: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  perk: { flexDirection: "row", alignItems: "center", gap: 12 },
  perkIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  perkText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successBox: {
    alignItems: "center",
    gap: 10,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
  },
  successTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  successText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  resetBtn: { marginTop: 4 },
  resetText: { fontSize: 13, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
});
