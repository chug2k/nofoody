import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Action, Brand, Empty } from "../components/market";
import { STAGE_MS, TRIP_MS } from "../state/ledger";
import { useStore } from "../state/store";
import { colors, courier, type, ui } from "../theme";

export default function TrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ledger, now } = useStore();
  const order = ledger.orders.find((o) => o.id === id);
  const [clock, setClock] = useState(Date.now);
  const width = useWindowDimensions().width;
  useEffect(() => {
    if (!order || order.completedAt || order.arrivesAt <= Date.now()) {
      setClock(Date.now());
      return;
    }
    const timer = setInterval(() => setClock(Date.now()), 220);
    return () => clearInterval(timer);
  }, [order?.id, order?.arrivesAt, order?.completedAt]);
  if (!order)
    return (
      <Empty
        title="Không tìm thấy chuyến"
        message="Chuyến giao được lưu trong trình duyệt nơi bạn đặt món."
      />
    );
  const elapsed = Math.max(0, Math.max(now, clock) - order.startedAt);
  if (order.completedAt)
    return <Redirect href={{ pathname: "/done", params: { id: order.id } }} />;
  const stages = [
    "Quán đã nhận đơn",
    "Bếp đang chuẩn bị… không khí",
    "Tài xế Mây đã lấy món",
    "Lách qua 47 chiếc xe máy",
    "Đã tới cửa tưởng tượng",
  ];
  const stage = Math.min(stages.length - 1, Math.floor(elapsed / STAGE_MS));
  const progress = Math.min(1, elapsed / TRIP_MS);
  const lane = Math.max(20, Math.min(width, 680) - 40 - 34 - 76);
  return (
    <View style={ui.screen}>
      <Brand back={() => router.replace("/")} />
      <ScrollView contentContainerStyle={ui.pad}>
        <View style={{ gap: 3 }}>
          <Text style={ui.eyebrow}>
            {order.id} · {order.city.toLocaleUpperCase("vi-VN")}
          </Text>
          <Text accessibilityRole="header" style={ui.heading}>
            Đang giao… hư không.
          </Text>
          <Text style={ui.body}>
            {order.restaurantName} → Cửa nhà tưởng tượng
          </Text>
        </View>
        <View
          style={{
            borderRadius: 15,
            backgroundColor: colors.green,
            padding: 17,
            overflow: "hidden",
          }}
        >
          <View style={{ height: 65, justifyContent: "flex-end" }}>
            <View style={{ height: 2, backgroundColor: "#87ad96" }} />
            <Image
              accessible={false}
              source={courier}
              resizeMode="contain"
              style={{
                position: "absolute",
                left: lane * progress,
                bottom: 0,
                width: 76,
                height: 59,
              }}
            />
          </View>
          <View style={[ui.split, { marginTop: 10 }]}>
            <Text
              style={{
                fontFamily: type.bodyBold,
                fontSize: 12,
                color: colors.white,
              }}
            >
              Bếp
            </Text>
            <Text
              style={{
                fontFamily: type.bodyBold,
                fontSize: 12,
                color: colors.white,
              }}
            >
              Cửa nhà
            </Text>
          </View>
        </View>
        <View style={ui.box}>
          {stages.map((label, i) => (
            <View key={label} style={[ui.row, { paddingVertical: 3 }]}>
              <View
                style={{
                  height: 29,
                  width: 29,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  backgroundColor:
                    i === stage
                      ? colors.green
                      : i < stage
                        ? colors.mint
                        : colors.light,
                }}
              >
                <Text
                  style={[
                    ui.small,
                    {
                      color: i === stage ? colors.white : colors.ink,
                      fontFamily: type.heading,
                    },
                  ]}
                >
                  {i < stage ? "✓" : i + 1}
                </Text>
              </View>
              <Text style={[i === stage ? ui.strong : ui.body, { flex: 1 }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
        <Text accessibilityLiveRegion="polite" style={ui.small}>
          {"Chặng " + (stage + 1) + "/5 · " + stages[stage]}
        </Text>
        <Action
          label="Về chợ trong lúc chờ"
          secondary
          onPress={() => router.replace("/")}
        />
      </ScrollView>
    </View>
  );
}
