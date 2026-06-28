import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { PlatformSymbol } from "@/components/ui/platform-symbol";
import { ForecastColors } from "@/constants/forecast-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";

function getUserDisplayName(
  user: NonNullable<ReturnType<typeof useUser>["user"]>,
) {
  const fullName = user.fullName?.trim();
  if (fullName) return fullName;

  const firstName = user.firstName?.trim();
  if (firstName) return firstName;

  const username = user.username?.trim();
  if (username) return username;

  const email = user.primaryEmailAddress?.emailAddress;
  if (email) return email.split("@")[0] ?? "Account";

  return "Account";
}

export function UserAccountButton() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = useTheme();
  const palette =
    scheme === "dark" ? ForecastColors.dark : ForecastColors.light;

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <Pressable
        style={[styles.button, { borderColor: palette.borderStrong }]}
        onPress={() => router.push("/sign-in")}
        accessibilityRole="button"
        accessibilityLabel="Sign in or create account"
      >
        <PlatformSymbol
          name={{ ios: "person.crop.circle", android: "person", web: "person" }}
          size={18}
          tintColor={palette.accent}
        />
        <ThemedText style={[styles.label, { color: palette.accent }]}>
          Account
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.button, { borderColor: palette.borderStrong }]}
      onPress={() => void signOut()}
      accessibilityRole="button"
      accessibilityLabel={`Sign out as ${user ? getUserDisplayName(user) : "Account"}`}
    >
      <PlatformSymbol
        name={{
          ios: "person.crop.circle.fill",
          android: "person",
          web: "person",
        }}
        size={18}
        tintColor={theme.textSecondary}
      />
      <ThemedText
        themeColor="textSecondary"
        numberOfLines={1}
        style={styles.label}
      >
        {user ? getUserDisplayName(user) : "Account"}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
});
