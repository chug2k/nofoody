import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Pressable, Text, View } from "react-native";
import { colors, type } from "../theme";
import { type Edit, type Ledger } from "./ledger";
import { accessLedger, watchLedger } from "./persistence";

type Store = {
  ledger: Ledger;
  now: number;
  write: (edit: Edit) => Promise<boolean>;
};
const Context = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now);
  const receive = useCallback((next: Ledger) => {
    setLedger((previous) =>
      !previous || next.revision >= previous.revision ? next : previous,
    );
    setNow(Date.now());
  }, []);
  const refresh = useCallback(async () => {
    try {
      receive(await accessLedger());
    } catch {
      setError(
        "Không mở được bộ nhớ trên thiết bị. Hãy cho phép trình duyệt lưu dữ liệu rồi thử lại.",
      );
    }
  }, [receive]);
  useEffect(() => {
    void refresh();
    return watchLedger(refresh);
  }, [refresh]);
  useEffect(() => {
    const upcoming =
      ledger?.orders.filter((o) => !o.completedAt).map((o) => o.arrivesAt) ??
      [];
    if (!upcoming.length) return;
    const timer = setTimeout(
      () => void refresh(),
      Math.max(10, Math.min(...upcoming) - Date.now() + 10),
    );
    return () => clearTimeout(timer);
  }, [ledger, now, refresh]);
  const write = useCallback(
    async (edit: Edit) => {
      try {
        receive(await accessLedger(edit));
        setError("");
        return true;
      } catch (e) {
        const message =
          e instanceof Error && e.name === "Error"
            ? e.message
            : "Chưa lưu được. Hãy thử lại khi thiết bị còn chỗ trống.";
        setError(message);
        void refresh();
        return false;
      }
    },
    [receive, refresh],
  );

  return (
    <View style={{ flex: 1 }}>
      {!!error && (
        <View style={{ backgroundColor: "#ffe3b9", padding: 14, gap: 6 }}>
          <Text
            accessibilityRole="alert"
            style={{ color: colors.ink, fontFamily: type.bodyBold }}
          >
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setError("");
              void refresh();
            }}
            style={{ paddingVertical: 8 }}
          >
            <Text style={{ color: colors.ink, fontFamily: type.heading }}>
              {ledger ? "Tải lại sổ" : "Thử lại"}
            </Text>
          </Pressable>
        </View>
      )}
      {ledger ? (
        <Context.Provider value={{ ledger, write, now }}>
          {children}
        </Context.Provider>
      ) : (
        !error && (
          <Text style={{ margin: 26, color: colors.ink }}>Đang mở sổ đơn…</Text>
        )
      )}
    </View>
  );
}

export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("NoFoody store is unavailable");
  return store;
}
