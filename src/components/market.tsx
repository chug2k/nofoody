import { useRouter } from "expo-router";
import { Image, Pressable, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, type, ui } from "../theme";

export function Action({
  label,
  onPress,
  secondary,
  disabled,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: secondary ? colors.paper : colors.green,
        opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: secondary ? colors.line : colors.green,
        borderRadius: 11,
      })}
    >
      <Text
        style={{
          fontFamily: type.heading,
          fontSize: 15,
          lineHeight: 22,
          textAlign: "center",
          color: secondary ? colors.ink : colors.white,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Brand({
  back,
  book = false,
}: {
  back?: () => void;
  book?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        ui.split,
        {
          paddingHorizontal: 18,
          minHeight: 62 + insets.top,
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
          backgroundColor: colors.paper,
        },
      ]}
    >
      <View style={ui.row}>
        {back ? (
          <Pressable
            onPress={back}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={{ minWidth: 42, height: 44, justifyContent: "center" }}
          >
            <Text style={{ fontSize: 26, color: colors.ink }}>←</Text>
          </Pressable>
        ) : (
          <Image
            source={require("../../assets/favicon.png")}
            style={{ width: 30, height: 30, borderRadius: 9 }}
          />
        )}
        <Text
          style={{
            fontFamily: type.display,
            fontSize: 24,
            lineHeight: 33,
            letterSpacing: -1.4,
            color: colors.ink,
          }}
        >
          NoFoody
        </Text>
      </View>
      {book ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Mở sổ đơn"
          onPress={() => router.push("/book")}
          style={{
            minHeight: 44,
            justifyContent: "center",
            paddingHorizontal: 5,
          }}
        >
          <Text style={[ui.strong, { fontSize: 13 }]}>Sổ đơn ↗</Text>
        </Pressable>
      ) : (
        <Text style={[ui.eyebrow, { color: colors.green }]}>MÔ PHỎNG</Text>
      )}
    </View>
  );
}

export function Quantity({
  name,
  qty,
  add,
  remove,
}: {
  name: string;
  qty: number;
  add: () => void;
  remove: () => void;
}) {
  const button: ViewStyle = {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <View style={[ui.row, { gap: 2 }]}>
      {qty > 0 && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={"Bớt " + name}
            onPress={remove}
            style={({ pressed }) => [
              button,
              { backgroundColor: colors.light, opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Text style={{ color: colors.ink, fontSize: 22 }}>−</Text>
          </Pressable>
          <Text style={[ui.strong, { minWidth: 18, textAlign: "center" }]}>
            {qty}
          </Text>
        </>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={"Thêm " + name}
        disabled={qty >= 99}
        onPress={add}
        style={({ pressed }) => [
          button,
          {
            backgroundColor: colors.green,
            opacity: pressed || qty >= 99 ? 0.65 : 1,
          },
        ]}
      >
        <Text style={{ color: colors.white, fontSize: 22 }}>+</Text>
      </Pressable>
    </View>
  );
}

export function Pair({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={ui.split}>
      <Text style={[bold ? ui.strong : ui.body, { flex: 1 }]}>{label}</Text>
      <Text style={[bold ? ui.subhead : ui.strong, { textAlign: "right" }]}>
        {value}
      </Text>
    </View>
  );
}

export function Empty({ title, message }: { title: string; message: string }) {
  const router = useRouter();
  return (
    <View style={ui.screen}>
      <Brand back={() => router.replace("/")} />
      <View style={ui.pad}>
        <Text accessibilityRole="header" style={ui.heading}>
          {title}
        </Text>
        <Text style={ui.body}>{message}</Text>
        <Action label="Về chọn món" onPress={() => router.replace("/")} />
      </View>
    </View>
  );
}
