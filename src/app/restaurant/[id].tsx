import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { Action, Brand, Empty, Quantity } from "../../components/market";
import { RESTAURANTS } from "../../data/restaurants";
import { cityName, type MenuItem } from "../../data/types";
import { editLine, sumLines } from "../../state/ledger";
import { useStore } from "../../state/store";
import { art, colors, formatVnd, ui } from "../../theme";

export async function generateStaticParams() {
  return RESTAURANTS.map(({ id }) => ({ id }));
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { ledger, write } = useStore();
  const [replacement, setReplacement] = useState<{
    item: MenuItem;
    oldId: string;
  } | null>(null);
  const restaurant = RESTAURANTS.find((r) => r.id === id);
  if (!restaurant)
    return (
      <Empty
        title="Quán chưa mở"
        message="Hãy chọn một quán đang có trong chợ."
      />
    );
  const r = restaurant;
  const cart = ledger.cart;
  const here = cart?.restaurantId === r.id ? cart : null;
  function change(item: MenuItem, delta: 1 | -1) {
    if (cart && cart.restaurantId !== r.id) {
      setReplacement({ item, oldId: cart.id });
      return;
    }
    void write(editLine(r, item, delta, cart?.id ?? null));
  }
  return (
    <View style={ui.screen}>
      <Brand
        back={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <View style={[ui.row, { padding: 20, alignItems: "stretch", gap: 13 }]}>
          <View style={{ flex: 1, justifyContent: "center", gap: 6 }}>
            <Text style={ui.eyebrow}>
              {cityName[r.city].toLocaleUpperCase("vi-VN")} · QUÁN HƯ CẤU
            </Text>
            <Text accessibilityRole="header" style={ui.heading}>
              {r.name}
            </Text>
          </View>
          <Image
            accessible={false}
            source={art[r.id]}
            resizeMode="cover"
            style={{ width: "33%", minHeight: 104, borderRadius: 11 }}
          />
        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Text style={ui.body}>{r.description}</Text>
        </View>
        <View style={[ui.rule, { marginHorizontal: 20 }]} />
        <View style={[ui.pad, { paddingBottom: 0 }]}>
          <Text accessibilityRole="header" style={ui.subhead}>
            Thực đơn
          </Text>
          <Text style={ui.small}>
            Giá và kcal là số liệu giả lập của trò chơi.
          </Text>
          {r.items.map((item) => {
            const qty =
              here?.lines.find((line) => line.item.id === item.id)?.qty ?? 0;
            return (
              <View
                key={item.id}
                style={[
                  ui.split,
                  {
                    borderBottomWidth: 1,
                    borderColor: colors.line,
                    paddingBottom: 12,
                    minHeight: 66,
                  },
                ]}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={ui.strong}>{item.name}</Text>
                  <Text style={ui.small}>
                    {formatVnd(item.price)} · {item.calories} kcal
                  </Text>
                </View>
                <Quantity
                  name={item.name}
                  qty={qty}
                  add={() => change(item, 1)}
                  remove={() => change(item, -1)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
      {replacement && (
        <View style={[ui.footer, { gap: 7 }]}>
          <Text style={ui.strong}>
            Thay giỏ cũ bằng {replacement.item.name.toLocaleLowerCase("vi-VN")}?
          </Text>
          <Text style={ui.body}>Mỗi chuyến chỉ ghé một quán.</Text>
          <Action
            label="Thay giỏ và thêm món"
            onPress={async () => {
              const saved = await write(
                editLine(r, replacement.item, 1, replacement.oldId, true),
              );
              if (saved) setReplacement(null);
            }}
          />
          <Action
            label="Giữ giỏ hiện tại"
            secondary
            onPress={() => setReplacement(null)}
          />
        </View>
      )}
      {cart && !replacement && (
        <View style={ui.footer}>
          <Action
            label={"Xem giỏ hàng · " + formatVnd(sumLines(cart.lines).savedVnd)}
            onPress={() => router.push("/cart")}
          />
        </View>
      )}
    </View>
  );
}
