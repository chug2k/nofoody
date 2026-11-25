/* Run against a served static export. All browser profiles and orders are test fixtures. */
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const base = new URL(process.argv[2] || "http://127.0.0.1:4173/nofoody/");
const evidence = process.env.NOFOODY_PROOF;
const errors = [];
const otherOrigins = new Set();
const checkpoints = [];
const options = {
  channel: process.env.CHROME_CHANNEL || "chrome",
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  locale: "vi-VN",
  reducedMotion: "reduce",
};

function watch(page) {
  page.setDefaultTimeout(12000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (!["http:", "https:"].includes(url.protocol)) return;
    if (url.origin !== base.origin) otherOrigins.add(url.origin);
    if (response.status() >= 400)
      errors.push(response.status() + " " + url.pathname);
  });
  return page;
}
function address(tail = "") {
  return new URL(tail, base).href;
}
const button = (page, name) => page.getByRole("button", { name, exact: true });
const link = (page, name) => page.getByRole("link", { name, exact: true });
async function grab(page, name) {
  if (evidence)
    await page.screenshot({
      path: path.join(evidence, name + ".png"),
      animations: "disabled",
    });
}
async function checkpoint(name, detail) {
  checkpoints.push({ name, detail });
  console.log(name, detail);
}
async function fits(page) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  );
}

async function main() {
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), "nofoody-browser-"));
  if (evidence) await fs.mkdir(evidence, { recursive: true });
  let context;
  try {
    context = await chromium.launchPersistentContext(profile, options);
    const page = watch(context.pages()[0]);
    await page.goto(address());
    await link(page, "Mở Bếp Mây Số 47").waitFor();
    await fits(page);
    await grab(page, "01-cho");
    await link(page, "Mở Bếp Mây Số 47").click();
    await page.reload();
    await button(page, "Thêm Phở mây sả").click();
    await button(page, "Xem giỏ hàng · 48.000₫").waitFor();
    await button(page, "Thêm Phở mây sả").click();
    await button(page, "Xem giỏ hàng · 96.000₫").waitFor();
    await button(page, "Thêm Trà sương quýt").click();
    await button(page, "Xem giỏ hàng · 114.000₫").click();
    await button(page, "Đặt đơn mô phỏng").waitFor();
    await page.reload();
    await button(page, "Đặt đơn mô phỏng").waitFor();
    assert(await page.getByText("114.000₫", { exact: true }).isVisible());
    assert(await page.getByText("780 kcal", { exact: true }).isVisible());
    await fits(page);
    await grab(page, "02-gio-hang");
    await checkpoint(
      "Cart survived reload",
      "2 × 48.000₫ + 1 × 18.000₫ = 114.000₫, 780 kcal",
    );

    // Simulate one full-device write on this browser only, before a receipt commits.
    await page.evaluate(() => {
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (value, ...rest) {
        if (
          this.name === "local-session" &&
          value.orders?.length &&
          value.cart === null
        ) {
          IDBObjectStore.prototype.put = put;
          throw new DOMException("Test-only full device", "QuotaExceededError");
        }
        return put.call(this, value, ...rest);
      };
    });
    await button(page, "Đặt đơn mô phỏng").click();
    await button(page, "Thử đặt lại").waitFor();
    assert(await page.getByText("114.000₫", { exact: true }).isVisible());
    const second = watch(await context.newPage());
    await second.goto(address("book/"));
    assert.equal(await second.getByTestId("book-savings").textContent(), "0₫");
    assert.equal(
      await second.getByTestId("book-count").textContent(),
      "0 đơn hoàn tất · 0 kcal",
    );
    await checkpoint(
      "Write failure left the cart intact",
      "0 orders after aborted save; visible retry",
    );

    await second.goto(address("cart/"));
    await button(second, "Đặt đơn mô phỏng").waitFor();
    // Both browser tabs have reviewed the same cart. Deliver the taps without changing focus.
    const simultaneous = await Promise.all([
      page.evaluate(() => {
        const b = document.querySelector('[aria-label="Thử đặt lại"]');
        b?.click();
        b?.click();
        return !!b;
      }),
      second.evaluate(() => {
        const b = document.querySelector('[aria-label="Đặt đơn mô phỏng"]');
        b?.click();
        return !!b;
      }),
    ]);
    assert(simultaneous[0] && simultaneous[1]);
    await page.waitForURL((url) =>
      url.pathname.replace(/\/$/, "").endsWith("/tracking"),
    );
    const orderId = new URL(page.url()).searchParams.get("id");
    assert.equal(orderId, "NF-0001");
    // A saved order becomes a lifetime credit only when the courier arrives.
    await second.goto(address("book/"));
    assert.equal(await second.getByTestId("book-savings").textContent(), "0₫");
    await link(second, "Mở đơn " + orderId).waitFor();
    await page.getByText(/Chặng 3\/5/).waitFor();
    await grab(page, "03-chuyen-giao");
    await page.reload();
    await page.getByText(/Chặng [345]\/5/).waitFor();
    await page.getByTestId("receipt-savings").waitFor({ timeout: 18000 });
    assert.equal(
      await page.getByTestId("receipt-savings").textContent(),
      "114.000₫",
    );
    assert.equal(
      await page.getByTestId("lifetime").textContent(),
      "1 đơn · 114.000₫ · 780 kcal",
    );
    await fits(page);
    await grab(page, "04-bien-lai");
    const receipt = page.url();
    await page.reload();
    assert.equal(
      await page.getByTestId("lifetime").textContent(),
      "1 đơn · 114.000₫ · 780 kcal",
    );
    await page.goto(address("tracking/?id=" + orderId + "&saved=999999"));
    assert.equal(
      await page.getByTestId("receipt-savings").textContent(),
      "114.000₫",
    );
    await checkpoint(
      "Retries and tracking reload count once",
      orderId + " · 1 order · 114.000₫ · 780 kcal",
    );

    await button(page, "Chọn món tiếp").click();
    await button(page, "Hà Nội").click();
    const search = page.getByRole("textbox", {
      name: "Tìm quán hoặc món trong thành phố",
    });
    await search.fill("bun trang khuyet");
    await link(page, "Mở Gánh Bún Mặt Trăng").click();
    await button(page, "Thêm Bún trăng khuyết").click();
    await button(page, "Xem giỏ hàng · 56.000₫").click();
    await button(page, "Đặt đơn mô phỏng").click();
    await page.getByRole("heading", { name: "Đang giao… hư không." }).waitFor();
    await context.close();
    context = undefined;
    // The tab and browser process are gone throughout the simulated arrival.
    await new Promise((resolve) => setTimeout(resolve, 13500));
    context = await chromium.launchPersistentContext(profile, options);
    const reopened = watch(context.pages()[0]);
    await reopened.goto(address("book/"));
    assert.equal(
      await reopened.getByTestId("book-savings").textContent(),
      "170.000₫",
    );
    assert.equal(
      await reopened.getByTestId("book-count").textContent(),
      "2 đơn hoàn tất · 1.190 kcal",
    );
    await grab(reopened, "05-so-don");
    await link(reopened, "Mở đơn NF-0002").click();
    assert.equal(
      await reopened.getByTestId("receipt-savings").textContent(),
      "56.000₫",
    );
    await reopened.goto(receipt);
    assert.equal(
      await reopened.getByTestId("receipt-savings").textContent(),
      "114.000₫",
    );
    assert.equal(
      await reopened.getByTestId("lifetime").textContent(),
      "2 đơn · 170.000₫ · 1.190 kcal",
    );
    await checkpoint(
      "Browser restart closed the second trip",
      "NF-0001 + NF-0002 = 170.000₫, 1.190 kcal; old receipt still 114.000₫",
    );

    await reopened.goto(address("done/?id=unknown&saved=999999"));
    await reopened
      .getByRole("heading", { name: "Không tìm thấy biên lai" })
      .waitFor();
    await button(reopened, "Về chọn món").click();
    await reopened.setViewportSize({ width: 320, height: 667 });
    await link(reopened, "Mở Bếp Mây Số 47").waitFor();
    await fits(reopened);
    await grab(reopened, "06-cho-320");
    await reopened.setViewportSize({ width: 1280, height: 850 });
    await fits(reopened);
    await grab(reopened, "07-cho-desktop");
    await checkpoint(
      "Unknown order and responsive layout",
      "unknown receipt rejected; 320, 390, and 1280 CSS pixels",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual([...otherOrigins], []);
    await checkpoint(
      "Browser and network",
      "no page errors, HTTP failures, or cross-origin requests",
    );
    if (evidence)
      await fs.writeFile(
        path.join(evidence, "results.json"),
        JSON.stringify(
          { base: base.href, viewport: options.viewport, checkpoints },
          null,
          2,
        ) + "\n",
      );
  } finally {
    if (context) await context.close();
    await fs.rm(profile, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
