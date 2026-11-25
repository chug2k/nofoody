import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Action, Brand, Empty, Pair } from "../components/market";
import { lifetime, sumLines } from "../state/ledger";
import { useStore } from "../state/store";
import { colors, formatKcal, formatVnd, type, ui } from "../theme";

export default function DoneScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ledger } = useStore();
  const order = ledger.orders.find((o) => o.id === id);
  if (!order)
    return (
      <Empty
        title="Không tìm thấy biên lai"
        message="Mở Sổ đơn trong trình duyệt nơi bạn đã đặt món."
      />
    );
  if (!order.completedAt)
    return (
      <Redirect href={{ pathname: "/tracking", params: { id: order.id } }} />
    );
  const total = sumLines(order.lines);
  const stats = lifetime(ledger);
  const date = new Date(order.startedAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <View style={ui.screen}>
      <Brand back={() => router.replace("/")} />
      <ScrollView contentContainerStyle={ui.pad}>
        <View style={{ gap: 4 }}>
          <Text style={ui.eyebrow}>CHUYẾN GIAO HOÀN TẤT</Text>
          <Text accessibilityRole="header" style={ui.heading}>
            Không có gì được giao!
          </Text>
          <Text style={ui.body}>
            Tài xế Mây đã đến. Đây là phần còn lại trong ví tưởng tượng của bạn.
          </Text>
        </View>
        <View
          style={[
            ui.box,
            {
              borderRadius: 5,
              borderTopWidth: 4,
              borderTopColor: colors.green,
              gap: 12,
            },
          ]}
        >
          <View style={ui.split}>
            <Text style={ui.eyebrow}>BIÊN LAI MÔ PHỎNG</Text>
            <Text style={ui.strong}>{order.id}</Text>
          </View>
          <View>
            <Text style={ui.subhead}>{order.restaurantName}</Text>
            <Text style={ui.small}>
              {order.city} · {date}
            </Text>
          </View>
          <View style={[ui.rule, { borderStyle: "dashed" }]} />
          {order.lines.map((line) => (
            <View key={line.item.id} style={ui.split}>
              <View style={{ flex: 1 }}>
                <Text style={ui.strong}>
                  {line.qty} × {line.item.name}
                </Text>
                <Text style={ui.small}>{formatVnd(line.item.price)} / món</Text>
              </View>
              <Text style={ui.strong}>
                {formatVnd(line.item.price * line.qty)}
              </Text>
            </View>
          ))}
          <View style={[ui.rule, { borderStyle: "dashed" }]} />
          <Pair label="Thực trả" value="0₫" />
          <Pair
            label="Kcal giả lập của món"
            value={formatKcal(total.avoidedCalories)}
          />
          <View
            style={[
              ui.split,
              { backgroundColor: colors.mint, padding: 12, borderRadius: 7 },
            ]}
          >
            <Text style={[ui.strong, { flex: 1 }]}>Tiết kiệm đơn này</Text>
            <Text testID="receipt-savings" style={ui.subhead}>
              {formatVnd(total.savedVnd)}
            </Text>
          </View>
        </View>
        <View style={{ gap: 4 }}>
          <Text style={ui.eyebrow}>SỔ TRÊN THIẾT BỊ</Text>
          <Text
            testID="lifetime"
            style={[ui.strong, { fontFamily: type.heading }]}
          >
            {stats.orders} đơn · {formatVnd(stats.savedVnd)} ·{" "}
            {formatKcal(stats.avoidedCalories)}
          </Text>
        </View>
        <Action label="Chọn món tiếp" onPress={() => router.replace("/")} />
        <Action
          label="Xem sổ đơn"
          secondary
          onPress={() => router.push("/book")}
        />
      </ScrollView>
    </View>
  );
}
