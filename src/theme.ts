import { StyleSheet } from "react-native";

export const colors = {
  paper: "#FBF8F0",
  white: "#FFFEFB",
  ink: "#203A33",
  dim: "#52655B",
  green: "#205944",
  mint: "#C6E4CF",
  coral: "#F49A77",
  line: "#CDD4C6",
  muted: "#E9EADD",
  light: "#F6F1E4",
} as const;
export const type = {
  display: "BeVietnamPro_800ExtraBold",
  heading: "BeVietnamPro_700Bold",
  bodyBold: "BeVietnamPro_600SemiBold",
  body: "BeVietnamPro_400Regular",
} as const;
export function formatVnd(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}
export const formatKcal = (n: number) => n.toLocaleString("vi-VN") + " kcal";
export const art: Record<string, number> = {
  "bep-may-47": require("../assets/cloud.png"),
  "lo-sao-choi": require("../assets/comet.png"),
  "ganh-mat-trang": require("../assets/moon.png"),
  "tram-mua-giay": require("../assets/paper-rain.png"),
};
export const courier = require("../assets/courier.png");
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  pad: { paddingHorizontal: 20, paddingVertical: 18, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  split: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  eyebrow: {
    fontFamily: type.heading,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 1.6,
    color: colors.dim,
  },
  heading: {
    fontFamily: type.display,
    fontSize: 31,
    lineHeight: 42,
    letterSpacing: -1.15,
    color: colors.ink,
  },
  subhead: {
    fontFamily: type.heading,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.45,
    color: colors.ink,
  },
  strong: {
    fontFamily: type.bodyBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  body: {
    fontFamily: type.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.dim,
  },
  small: {
    fontFamily: type.body,
    fontSize: 12,
    lineHeight: 19,
    color: colors.dim,
  },
  rule: { borderTopWidth: 1, borderColor: colors.line },
  box: {
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 16,
    gap: 10,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.paper,
  },
});
