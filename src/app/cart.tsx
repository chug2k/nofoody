import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Action, Brand, Empty, Pair, Quantity } from "../components/market";
import { RESTAURANTS } from "../data/restaurants";
import { editLine, placeOrder, sumLines } from "../state/ledger";
import { useStore } from "../state/store";
import { colors, formatKcal, formatVnd, ui } from "../theme";

export default function CartScreen() {
  const router = useRouter();
  const { ledger, write } = useStore();
  const submitting = useRef(false);
  const [placing, setPlacing] = useState(false);
  const [failed, setFailed] = useState(false);
  const cart = ledger.cart;
  const restaurant = RESTAURANTS.find((r) => r.id === cart?.restaurantId);
  if (!cart || !restaurant) {
    const latest = ledger.orders[0];
    if (latest)
      return (
        <View style={ui.screen}>
          <Brand back={() => router.replace("/")} />
          <View style={ui.pad}>
            <Text accessibilityRole="header" style={ui.heading}>
              Giỏ hàng trống
            </Text>
            <Text style={ui.body}>Đơn gần nhất của bạn là {latest.id}.</Text>
            <Action
              label={"Mở đơn " + latest.id}
              onPress={() =>
                router.replace({
                  pathname: "/tracking",
                  params: { id: latest.id },
                })
              }
            />
            <Action
              label="Về chọn món"
              secondary
              onPress={() => router.replace("/")}
            />
          </View>
        </View>
      );
    return (
      <Empty
        title="Giỏ hàng trống"
        message="Chọn món ở một quán tưởng tượng để bắt đầu chuyến giao."
      />
    );
  }
  const total = sumLines(cart.lines);
  async function checkout() {
    if (!cart || !restaurant || submitting.current) return;
    submitting.current = true;
    setPlacing(true);
    const ok = await write(placeOrder(cart, restaurant, Date.now()));
    setFailed(!ok);
    if (ok) router.replace({ pathname: "/tracking", params: { id: cart.id } });
    submitting.current = false;
    setPlacing(false);
  }
  return (
    <View style={ui.screen}>
      <Brand
        back={() =>
          router.canGoBack()
            ? router.back()
            : router.replace({
                pathname: "/restaurant/[id]",
                params: { id: restaurant.id },
              })
        }
      />
      <ScrollView contentContainerStyle={ui.pad}>
        <View style={{ gap: 3 }}>
          <Text style={ui.eyebrow}>{cart.id} · ĐƠN MÔ PHỎNG</Text>
          <Text accessibilityRole="header" style={ui.heading}>
            Giỏ hàng
          </Text>
          <Text style={ui.body}>{restaurant.name}</Text>
        </View>
        <View style={ui.box}>
          {cart.lines.map((line) => (
            <View key={line.item.id} style={[ui.split, { minHeight: 50 }]}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={ui.strong}>{line.item.name}</Text>
                <Text style={ui.small}>{formatVnd(line.item.price)} / món</Text>
              </View>
              <Quantity
                name={line.item.name}
                qty={line.qty}
                add={() =>
                  void write(editLine(restaurant, line.item, 1, cart.id))
                }
                remove={() =>
                  void write(editLine(restaurant, line.item, -1, cart.id))
                }
              />
            </View>
          ))}
        </View>
        <View style={ui.box}>
          <Pair
            label="Giá món trong trò chơi"
            value={formatVnd(total.savedVnd)}
          />
          <Pair
            label="Năng lượng giả lập"
            value={formatKcal(total.avoidedCalories)}
          />
          <Pair label="Phí giao tưởng tượng" value="0₫" />
          <View style={ui.rule} />
          <Pair label="Thực trả" value="0₫" bold />
        </View>
        <Text style={[ui.small, { color: colors.dim }]}>
          Chuyến đi mất khoảng 13 giây. Số tiền của món sẽ vào sổ khi chuyến kết
          thúc.
        </Text>
      </ScrollView>
      <View style={ui.footer}>
        <Action
          label={
            placing
              ? "Đang lưu đơn…"
              : failed
                ? "Thử đặt lại"
                : "Đặt đơn mô phỏng"
          }
          disabled={placing}
          onPress={checkout}
        />
      </View>
    </View>
  );
}
