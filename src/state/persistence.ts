import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { emptyLedger, settleDue, type Edit, type Ledger } from "./ledger";

const KEY = "nofoody:fictional-kitchens:v1";
let tail: Promise<unknown> = Promise.resolve();

export function accessLedger(edit?: Edit): Promise<Ledger> {
  const operation = tail.then(async () => {
    const raw = await AsyncStorage.getItem(KEY);
    const current: Ledger = raw
      ? JSON.parse(raw)
      : emptyLedger(await AsyncStorage.getItem("nofoody:stats:v1"));
    if (current.version !== 1)
      throw new Error("Hãy mở phiên bản NoFoody mới nhất.");
    const settled = settleDue(current, Date.now());
    const next = edit ? edit(settled) : settled;
    if (next === current) return current;
    const saved = { ...next, revision: current.revision + 1 };
    await AsyncStorage.setItem(KEY, JSON.stringify(saved));
    return saved;
  });
  tail = operation.catch(() => {});
  return operation;
}

export function watchLedger(refresh: () => void) {
  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") refresh();
  });
  return () => subscription.remove();
}
