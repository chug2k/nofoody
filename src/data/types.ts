export type City = "saigon" | "hanoi";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  calories: number;
  emoji: string;
};

export type Restaurant = {
  id: string;
  name: string;
  city: City;
  specialty: string;
  description: string;
  items: MenuItem[];
};

export const cityName = { saigon: "Sài Gòn", hanoi: "Hà Nội" } as const;
