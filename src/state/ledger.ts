import { cityName, type MenuItem, type Restaurant } from "../data/types";

export const STAGE_MS = 2600;
export const TRIP_MS = 5 * STAGE_MS;
export type Line = { item: MenuItem; qty: number };
export type Stats = {
  orders: number;
  savedVnd: number;
  avoidedCalories: number;
};
export type Cart = {
  id: string;
  restaurantId: string;
  revision: number;
  lines: Line[];
};
export type Order = Cart & {
  restaurantName: string;
  city: string;
  startedAt: number;
  arrivesAt: number;
  completedAt: number | null;
};
export type Ledger = {
  version: 1;
  revision: number;
  nextNumber: number;
  previous: Stats;
  cart: Cart | null;
  orders: Order[];
};
export type Edit = (state: Ledger) => Ledger;

export function emptyLedger(oldStats: string | null): Ledger {
  let previous: Stats = { orders: 0, savedVnd: 0, avoidedCalories: 0 };
  if (oldStats) {
    try {
      const old = JSON.parse(oldStats) as Stats;
      if (
        [old.orders, old.savedVnd, old.avoidedCalories].every(
          (n) => Number.isSafeInteger(n) && n >= 0,
        )
      ) {
        previous = {
          orders: old.orders,
          savedVnd: old.savedVnd,
          avoidedCalories: old.avoidedCalories,
        };
      }
    } catch {
      /* The older app treated unreadable legacy totals as empty. */
    }
  }
  return {
    version: 1,
    revision: 0,
    nextNumber: 1,
    previous,
    cart: null,
    orders: [],
  };
}

export function sumLines(lines: Line[]) {
  return {
    count: lines.reduce((sum, line) => sum + line.qty, 0),
    savedVnd: lines.reduce((sum, line) => sum + line.item.price * line.qty, 0),
    avoidedCalories: lines.reduce(
      (sum, line) => sum + line.item.calories * line.qty,
      0,
    ),
  };
}

// Persist completion once so a retry (or a later clock change) cannot undo it.
export function settleDue(state: Ledger, now: number): Ledger {
  const due = (order: Order) => !order.completedAt && order.arrivesAt <= now;
  if (!state.orders.some(due)) return state;
  return {
    ...state,
    orders: state.orders.map((order) =>
      due(order) ? { ...order, completedAt: order.arrivesAt } : order,
    ),
  };
}

export function lifetime(state: Ledger): Stats {
  const result = { ...state.previous };
  for (const order of state.orders) {
    if (!order.completedAt) continue;
    const total = sumLines(order.lines);
    result.orders += 1;
    result.savedVnd += total.savedVnd;
    result.avoidedCalories += total.avoidedCalories;
  }
  return result;
}

export function editLine(
  restaurant: Restaurant,
  item: MenuItem,
  delta: 1 | -1,
  expected: string | null,
  replace = false,
): Edit {
  return (state) => {
    const cart = state.cart;
    if (cart?.id !== (expected ?? undefined)) {
      throw new Error(
        "Giỏ đã thay đổi ở một cửa sổ khác. Hãy xem lại giỏ rồi thử tiếp.",
      );
    }
    const switching = !!cart && cart.restaurantId !== restaurant.id;
    if (switching && !replace)
      throw new Error("Giỏ hiện có món của quán khác.");
    const lines = switching ? [] : [...(cart?.lines ?? [])];
    const index = lines.findIndex((line) => line.item.id === item.id);
    const qty = (lines[index]?.qty ?? 0) + delta;
    if (qty < 0 || qty > 99) return state;
    if (qty === 0) lines.splice(index, 1);
    else if (index === -1) lines.push({ item, qty });
    else lines[index] = { ...lines[index], qty };
    const fresh = !cart || switching;
    const id = fresh
      ? "NF-" + String(state.nextNumber).padStart(4, "0")
      : cart.id;
    return {
      ...state,
      nextNumber: state.nextNumber + Number(fresh),
      cart: lines.length
        ? {
            id,
            restaurantId: restaurant.id,
            revision: state.revision + 1,
            lines,
          }
        : null,
    };
  };
}

export function placeOrder(
  expected: Cart,
  restaurant: Restaurant,
  now: number,
): Edit {
  return (state) => {
    if (state.orders.some((order) => order.id === expected.id)) return state;
    const cart = state.cart;
    if (
      !cart ||
      cart.id !== expected.id ||
      cart.revision !== expected.revision ||
      cart.restaurantId !== restaurant.id ||
      !cart.lines.length
    ) {
      throw new Error("Giỏ đã thay đổi. Hãy xem lại trước khi đặt.");
    }
    const order: Order = {
      ...cart,
      restaurantName: restaurant.name,
      city: cityName[restaurant.city],
      startedAt: now,
      arrivesAt: now + TRIP_MS,
      completedAt: null,
    };
    return { ...state, cart: null, orders: [order, ...state.orders] };
  };
}
