import {
  BeVietnamPro_400Regular,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
  BeVietnamPro_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/be-vietnam-pro";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StoreProvider } from "../state/store";
import { colors } from "../theme";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [loaded, error] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    BeVietnamPro_800ExtraBold,
  });
  return (
    <View style={{ flex: 1, backgroundColor: "#e7e9df", alignItems: "center" }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 680,
          paddingBottom: insets.bottom,
          backgroundColor: colors.paper,
        }}
      >
        {!loaded && !error ? (
          <Text style={{ padding: 24, color: colors.ink }}>
            NoFoody · Đang mở chợ…
          </Text>
        ) : (
          <StoreProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "none",
                contentStyle: { backgroundColor: colors.paper },
              }}
            />
          </StoreProvider>
        )}
      </View>
    </View>
  );
}
