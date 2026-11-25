import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Action, Brand } from "../components/market";
import { RESTAURANTS } from "../data/restaurants";
import { cityName, type City } from "../data/types";
import { lifetime, sumLines } from "../state/ledger";
import { useStore } from "../state/store";
import { art, colors, courier, formatVnd, type, ui } from "../theme";

const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export default function HomeScreen() {
  const router = useRouter();
  const { ledger } = useStore();
  const [city, setCity] = useState<City>("saigon");
  const [query, setQuery] = useState("");
  const compact = useWindowDimensions().width < 360;
  const stats = lifetime(ledger);
  const active = ledger.orders.find((o) => !o.completedAt);
  const results = RESTAURANTS.filter(
    (r) =>
      r.city === city &&
      fold(
        [r.name, r.specialty, ...r.items.map((i) => i.name)].join(" "),
      ).includes(fold(query.trim())),
  );
  return (
    <View style={ui.screen}>
      <Brand book />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View
          style={{
            backgroundColor: colors.green,
            paddingHorizontal: 22,
            paddingVertical: 20,
            overflow: "hidden",
          }}
        >
          <Text style={[ui.eyebrow, { color: colors.mint, marginBottom: 7 }]}>
            CHUYẾN GIAO TƯỞNG TƯỢNG
          </Text>
          <View
            style={{ minHeight: compact ? 108 : 120, justifyContent: "center" }}
          >
            <Image
              accessible={false}
              source={courier}
              resizeMode="contain"
              style={{
                position: "absolute",
                right: -12,
                width: "54%",
                height: "116%",
              }}
            />
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: type.display,
                fontSize: compact ? 36 : 44,
                lineHeight: compact ? 43 : 51,
                letterSpacing: -1.9,
                color: colors.white,
              }}
            >
              Đặt món{"\n"}cho vui.
            </Text>
          </View>
          <Text
            style={{
              fontFamily: type.body,
              fontSize: 13,
              lineHeight: 20,
              color: "#edf5e7",
              marginTop: 8,
            }}
          >
            Quán hư cấu. Tài xế tưởng tượng. Thanh toán 0₫.
          </Text>
        </View>
        {active && (
          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <Action
              label={"Theo dõi chuyến " + active.id}
              onPress={() =>
                router.push({
                  pathname: "/tracking",
                  params: { id: active.id },
                })
              }
            />
          </View>
        )}
        <View style={[ui.pad, { paddingBottom: 8 }]}>
          <View style={ui.split}>
            <Text accessibilityRole="header" style={ui.subhead}>
              Chọn quán
            </Text>
            <View
              style={[
                ui.row,
                {
                  gap: 3,
                  padding: 3,
                  borderRadius: 12,
                  backgroundColor: colors.muted,
                },
              ]}
            >
              {(["saigon", "hanoi"] as const).map((k) => (
                <Pressable
                  key={k}
                  accessibilityRole="button"
                  accessibilityLabel={cityName[k]}
                  accessibilityState={{ selected: k === city }}
                  onPress={() => setCity(k)}
                  style={{
                    minHeight: 40,
                    justifyContent: "center",
                    paddingHorizontal: 12,
                    borderRadius: 9,
                    backgroundColor: k === city ? colors.green : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: type.bodyBold,
                      fontSize: 13,
                      color: k === city ? colors.white : colors.ink,
                    }}
                  >
                    {cityName[k]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <TextInput
            accessibilityLabel="Tìm quán hoặc món trong thành phố"
            placeholder="Tìm quán hoặc món trong thành phố…"
            placeholderTextColor={colors.dim}
            value={query}
            onChangeText={setQuery}
            style={{
              minHeight: 44,
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: 10,
              backgroundColor: colors.white,
              paddingHorizontal: 13,
              fontFamily: type.body,
              fontSize: 14,
              color: colors.ink,
            }}
          />
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          {results.map((r) => (
            <Pressable
              key={r.id}
              accessibilityRole="link"
              accessibilityLabel={"Mở " + r.name}
              onPress={() =>
                router.push({
                  pathname: "/restaurant/[id]",
                  params: { id: r.id },
                })
              }
              style={({ pressed }) => [
                ui.row,
                {
                  borderBottomWidth: 1,
                  borderColor: colors.line,
                  paddingVertical: 13,
                  gap: 13,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Image
                source={art[r.id]}
                resizeMode="cover"
                style={{
                  width: compact ? 82 : 102,
                  height: 81,
                  borderRadius: 9,
                }}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={ui.eyebrow}>
                  {r.specialty.toLocaleUpperCase("vi-VN")}
                </Text>
                <Text style={[ui.subhead, { fontSize: 17, lineHeight: 24 }]}>
                  {r.name}
                </Text>
                <Text style={ui.small}>
                  {r.items.length} món · từ{" "}
                  {formatVnd(Math.min(...r.items.map((i) => i.price)))}
                </Text>
              </View>
              <Text style={ui.subhead}>›</Text>
            </Pressable>
          ))}
          {!results.length && (
            <View style={{ paddingVertical: 15, gap: 9 }}>
              <Text style={ui.body}>
                Không tìm thấy món này ở {cityName[city]}.
              </Text>
              <Action
                label="Xóa tìm kiếm"
                secondary
                onPress={() => setQuery("")}
              />
            </View>
          )}
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Xem tổng tiết kiệm"
            onPress={() => router.push("/book")}
            style={[
              ui.split,
              {
                padding: 15,
                marginTop: 18,
                backgroundColor: colors.light,
                borderRadius: 11,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={ui.strong}>Ví tưởng tượng</Text>
              <Text style={ui.small}>{stats.orders} đơn đã hoàn tất</Text>
            </View>
            <Text style={ui.subhead}>{formatVnd(stats.savedVnd)} ›</Text>
          </Pressable>
        </View>
      </ScrollView>
      {ledger.cart && (
        <View style={ui.footer}>
          <Action
            label={
              "Xem giỏ hàng · " +
              formatVnd(sumLines(ledger.cart.lines).savedVnd)
            }
            onPress={() => router.push("/cart")}
          />
        </View>
      )}
    </View>
  );
}
