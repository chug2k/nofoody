import { emptyLedger, settleDue, type Edit, type Ledger } from "./ledger";

const NAMESPACE = "nofoody-fictional-kitchens-v1";
const STORE = "local-session";
const KEY = "ledger";
let opening: Promise<IDBDatabase> | undefined;
let events: BroadcastChannel | undefined;

function open(): Promise<IDBDatabase> {
  if (!opening) {
    opening = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(NAMESPACE, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          opening = undefined;
        };
        resolve(db);
      };
    }).catch((error) => {
      opening = undefined;
      throw error;
    });
  }
  return opening;
}

function initial() {
  let old = null;
  try {
    old = localStorage.getItem("nofoody:stats:v1");
  } catch {
    /* IndexedDB may still work. */
  }
  return emptyLedger(old);
}

export async function accessLedger(edit?: Edit): Promise<Ledger> {
  const db = await open();
  // Overlapping read/write transactions on this store are serialized across tabs.
  return new Promise<Ledger>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const request = store.get(KEY);
    let result: Ledger;
    let changed = false;
    let cause: unknown;
    request.onsuccess = () => {
      try {
        const current = (request.result ?? initial()) as Ledger;
        if (current.version !== 1)
          throw new Error("Hãy tải lại phiên bản NoFoody mới nhất.");
        const settled = settleDue(current, Date.now());
        result = edit ? edit(settled) : settled;
        if (result !== current) {
          result = { ...result, revision: current.revision + 1 };
          store.put(result, KEY);
          changed = true;
        }
      } catch (error) {
        cause = error;
        tx.abort();
      }
    };
    tx.onabort = () =>
      reject(cause ?? tx.error ?? new Error("Không thể lưu trên thiết bị."));
    tx.oncomplete = () => {
      if (changed) {
        try {
          if (events) events.postMessage(result.revision);
          else
            localStorage.setItem(
              NAMESPACE + ":changed",
              String(result.revision),
            );
        } catch {
          /* A committed order remains available when a tab regains focus. */
        }
      }
      resolve(result);
    };
  });
}

export function watchLedger(refresh: () => void) {
  if (typeof BroadcastChannel === "function") {
    try {
      events = new BroadcastChannel(NAMESPACE);
      events.onmessage = refresh;
    } catch {
      // Some private browsing contexts allow IndexedDB but block messaging.
      events = undefined;
    }
  }
  const visible = () => {
    if (!document.hidden) refresh();
  };
  const storage = (event: StorageEvent) => {
    if (event.key === NAMESPACE + ":changed") refresh();
  };
  document.addEventListener("visibilitychange", visible);
  window.addEventListener("focus", refresh);
  window.addEventListener("storage", storage);
  return () => {
    document.removeEventListener("visibilitychange", visible);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("storage", storage);
    events?.close();
    events = undefined;
  };
}
