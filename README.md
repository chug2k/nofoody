# NoFoody

Chọn món ở một quán tưởng tượng tại Sài Gòn hoặc Hà Nội. Tài xế Mây sẽ lách qua 47 chiếc xe máy và giao đến tận cửa… một biên lai. Mỗi chuyến mất khoảng 13 giây. Quán, món, giá và kcal đều là dữ liệu hư cấu. Thanh toán thực tế luôn là 0₫.

Mục **Sổ đơn** lưu từng biên lai và tổng tiết kiệm giả lập trong trình duyệt đang dùng. Bạn có thể tải lại giỏ, đóng trình duyệt giữa chuyến hoặc mở lại một biên lai. Xóa dữ liệu trang web cũng xóa sổ trên thiết bị đó.

## Browser edition

This edition adapts the owner's original Vietnamese Expo prototype. It keeps the city menus, cart, five-stage scooter trip and savings receipt. All four kitchens, twelve menu entries, prices, calorie values, courier details and paper-cut illustrations were authored for this edition. The illustrations are bundled locally. Be Vietnam Pro includes its font license.

The browser saves a stable cart ID, item quantities and prices in IndexedDB. Checkout moves the cart into the order ledger in one transaction. Arrivals are recorded once, including trips that finish while the browser is closed. Prices on a receipt come from that order's saved items. The receipt URL carries only its local ID. Previous NoFoody lifetime counters on the same origin can be carried forward as an opening balance.

## Build and open

Use Node 24 and npm. From this directory, run the following commands.

```sh
npm ci
npm run check
npm run build
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open [NoFoody locally](http://127.0.0.1:4173/nofoody/). Keep the same protocol, host, port and browser profile to reopen your ledger. The exported files are under `dist/nofoody/` and are ready to serve from `/nofoody/`. The production branch contains the static files at its root.

## Verify a session

With the server running, use another terminal and an installed Chrome browser.

```sh
npm run test:browser -- http://127.0.0.1:4173/nofoody/
```

The test uses a temporary browser profile at 390 × 844. It reloads a cart, interrupts a local save, retries checkout in two tabs, reloads during the trip and restarts the browser before the second arrival. It also checks the 320-pixel layout and desktop view. Set `NOFOODY_PROOF` to a directory to save screenshots and the test results.

For a manual check, order two **Phở mây sả** and one **Trà sương quýt** from **Bếp Mây Số 47**. Look for 114.000₫ on the receipt and 0₫ paid. Next, order one **Bún trăng khuyết** from **Gánh Bún Mặt Trăng**. A fresh ledger should show two completed orders, 170.000₫ and 1.190 fictional kcal. Reopen the first receipt to see its original 114.000₫.
