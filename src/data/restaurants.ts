import type { Restaurant } from "./types";

// Original fictional fixtures for this edition. Prices and kcal are game values.
export const RESTAURANTS: Restaurant[] = [
  {
    id: "bep-may-47",
    name: "Bếp Mây Số 47",
    city: "saigon",
    specialty: "Phở & cuốn",
    description:
      "Quán nhỏ trên tầng mây thứ 47. Bếp vừa mở nắp, mùi sả đã bay mất.",
    items: [
      {
        id: "pho-may",
        name: "Phở mây sả",
        price: 48000,
        calories: 360,
        emoji: "🍜",
      },
      {
        id: "cuon-gio",
        name: "Cuốn gió mùa",
        price: 32000,
        calories: 210,
        emoji: "🌿",
      },
      {
        id: "tra-suong",
        name: "Trà sương quýt",
        price: 18000,
        calories: 60,
        emoji: "🍊",
      },
    ],
  },
  {
    id: "lo-sao-choi",
    name: "Lò Bánh Sao Chổi",
    city: "saigon",
    specialty: "Bánh mì",
    description: "Bánh ra lò theo quỹ đạo. Nhớ đặt trước khi sao chổi bay qua.",
    items: [
      {
        id: "banh-sao",
        name: "Bánh mì sao chổi",
        price: 38000,
        calories: 310,
        emoji: "🥖",
      },
      {
        id: "banh-quy-dao",
        name: "Bánh quy quỹ đạo",
        price: 16000,
        calories: 120,
        emoji: "🍪",
      },
      {
        id: "sua-dem",
        name: "Sữa cacao đêm",
        price: 24000,
        calories: 150,
        emoji: "🥛",
      },
    ],
  },
  {
    id: "ganh-mat-trang",
    name: "Gánh Bún Mặt Trăng",
    city: "hanoi",
    specialty: "Bún & bánh",
    description:
      "Đòn gánh vắt ngang vầng trăng. Chủ quán đếm đậu bằng ánh sao.",
    items: [
      {
        id: "bun-trang",
        name: "Bún trăng khuyết",
        price: 56000,
        calories: 410,
        emoji: "🍜",
      },
      {
        id: "banh-may-ngu",
        name: "Bánh mây ngủ",
        price: 22000,
        calories: 140,
        emoji: "🥟",
      },
      {
        id: "nuoc-sao",
        name: "Nước mơ sao",
        price: 19000,
        calories: 65,
        emoji: "🍑",
      },
    ],
  },
  {
    id: "tram-mua-giay",
    name: "Trạm Trà Mưa Giấy",
    city: "hanoi",
    specialty: "Trà & bánh",
    description:
      "Mưa xếp bằng giấy, trà ủ bằng chuyện kể. Cốc nào cũng có một đám mây.",
    items: [
      {
        id: "tra-mua",
        name: "Trà mưa giấy",
        price: 29000,
        calories: 85,
        emoji: "🍵",
      },
      {
        id: "banh-gap",
        name: "Bánh gấp nếp",
        price: 27000,
        calories: 175,
        emoji: "🥮",
      },
      {
        id: "ca-phe-suoi",
        name: "Cà phê suối mây",
        price: 35000,
        calories: 115,
        emoji: "☕",
      },
    ],
  },
];
