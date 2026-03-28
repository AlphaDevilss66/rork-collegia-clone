import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user-store";
import { useNotificationStore } from "@/stores/notification-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { View, ActivityIndicator } from "react-native";
import { colors, darkColors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import InAppNotification from "@/components/InAppNotification";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const { isDarkMode } = useThemeStore();
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  const currentColors = isDarkMode ? darkColors : colors;

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
        <InAppNotification
          notification={currentNotification}
          onDismiss={() => setCurrentNotification(null)}
          onPress={() => {
            // Handle notification press
            setCurrentNotification(null);
          }}
        />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isOnboarded, isLoading, isHydrated } = useUserStore();
  const { isDarkMode } = useThemeStore();
  const currentColors = isDarkMode ? darkColors : colors;

  // Show loading screen while checking authentication state or during rehydration
  if (isLoading || !isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: currentColors.background }}>
        <ActivityIndicator size="large" color={currentColors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerShown: false, // Hide headers by default
      }}
    >
      {!isAuthenticated ? (
        // Not authenticated - show auth screens
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/sign-in" options={{ title: "Sign In", headerShown: true }} />
          <Stack.Screen name="auth/sign-up" options={{ title: "Sign Up", headerShown: true }} />
          <Stack.Screen name="auth/role-selection" options={{ title: "Choose Your Role", headerShown: true }} />
        </>
      ) : !isOnboarded ? (
        // Authenticated but not onboarded - show onboarding
        <>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </>
      ) : (
        // Authenticated and onboarded - show main app
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile/[id]" options={{ title: "Profile", headerShown: true }} />
          <Stack.Screen name="create" options={{ headerShown: true }} />
          <Stack.Screen name="my-posts" options={{ headerShown: true }} />
          <Stack.Screen name="all-posts" options={{ headerShown: true }} />
          <Stack.Screen name="all-users" options={{ headerShown: true }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="hashtag/[tag]" options={{ headerShown: false }} />
          <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}