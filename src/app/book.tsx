import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Action, Brand } from "../components/market";
import { lifetime, sumLines } from "../state/ledger";
import { useStore } from "../state/store";
import { colors, formatKcal, formatVnd, type, ui } from "../theme";

export default function BookScreen() {
  const router = useRouter();
  const { ledger } = useStore();
  const stats = lifetime(ledger);
  return (
    <View style={ui.screen}>
      <Brand back={() => router.replace("/")} />
      <ScrollView contentContainerStyle={ui.pad}>
        <Text accessibilityRole="header" style={ui.heading}>
          Sổ đơn
        </Text>
        <View
          style={{
            padding: 20,
            backgroundColor: colors.green,
            borderRadius: 14,
            gap: 5,
          }}
        >
          <Text style={[ui.eyebrow, { color: colors.mint }]}>
            TỔNG TIẾT KIỆM GIẢ LẬP
          </Text>
          <Text
            testID="book-savings"
            style={[ui.heading, { color: colors.white }]}
          >
            {formatVnd(stats.savedVnd)}
          </Text>
          <Text
            testID="book-count"
            style={{ fontFamily: type.body, fontSize: 14, color: colors.white }}
          >
            {stats.orders} đơn hoàn tất · {formatKcal(stats.avoidedCalories)}
          </Text>
        </View>
        <Text style={ui.body}>
          Biên lai được lưu trong trình duyệt này. Mở một đơn để xem lại chuyến
          giao hoặc biên lai.
        </Text>
        {!!ledger.previous.orders && (
          <Text style={ui.small}>
            Phiên bản cũ đã ghi nhận {ledger.previous.orders} đơn ·{" "}
            {formatVnd(ledger.previous.savedVnd)} ·{" "}
            {formatKcal(ledger.previous.avoidedCalories)}.
          </Text>
        )}
        {!ledger.orders.length && (
          <Text style={ui.strong}>Chưa có biên lai mới.</Text>
        )}
        {ledger.orders.map((order) => {
          const finished = !!order.completedAt;
          return (
            <Pressable
              key={order.id}
              accessibilityRole="link"
              accessibilityLabel={"Mở đơn " + order.id}
              onPress={() =>
                router.push({
                  pathname: finished ? "/done" : "/tracking",
                  params: { id: order.id },
                })
              }
              style={({ pressed }) => [
                ui.split,
                {
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: colors.line,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={ui.eyebrow}>
                  {order.id} · {finished ? "HOÀN TẤT" : "ĐANG GIAO"}
                </Text>
                <Text style={ui.strong}>{order.restaurantName}</Text>
              </View>
              <Text style={ui.strong}>
                {formatVnd(sumLines(order.lines).savedVnd)} ›
              </Text>
            </Pressable>
          );
        })}
        <Action
          label="Về chọn món"
          secondary
          onPress={() => router.replace("/")}
        />
      </ScrollView>
    </View>
  );
}
