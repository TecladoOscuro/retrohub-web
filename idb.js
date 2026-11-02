// Envoltorio mínimo de IndexedDB para ROMs y estados de guardado (slots).
const RetroDB = (() => {
  const DB_NAME = "retrohub-web";
  const DB_VERSION = 2;
  const STORE_ROMS = "roms";
  const STORE_STATES = "states";

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_ROMS)) {
          db.createObjectStore(STORE_ROMS, { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_STATES)) {
          // Clave: "gameId:slot"
          db.createObjectStore(STORE_STATES, { keyPath: "key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function tx(mode, storeName, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(storeName, mode);
      const store = t.objectStore(storeName);
      const result = fn(store);
      t.oncomplete = () => resolve(result);
      t.onerror = () => reject(t.error);
    });
  }

  function reqToPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  return {
    // --- ROMs ---
    add(rom) { return tx("readwrite", STORE_ROMS, (s) => s.add(rom)); },
    async all() {
      const db = await open();
      return reqToPromise(db.transaction(STORE_ROMS).objectStore(STORE_ROMS).getAll());
    },
    async get(id) {
      const db = await open();
      return reqToPromise(db.transaction(STORE_ROMS).objectStore(STORE_ROMS).get(id));
    },
    remove(id) { return tx("readwrite", STORE_ROMS, (s) => s.delete(id)); },

    // --- Slots de estados ---
    saveState(gameId, slot, data) { // data: {state: ArrayBuffer, screenshot: string|null}
      const key = `${gameId}:${slot}`;
      return tx("readwrite", STORE_STATES, (s) =>
        s.put({ key, gameId, slot, date: Date.now(), ...data })
      );
    },
    async getState(gameId, slot) {
      const db = await open();
      return reqToPromise(
        db.transaction(STORE_STATES).objectStore(STORE_STATES).get(`${gameId}:${slot}`)
      );
    },
    async statesFor(gameId) {
      const all = await (async () => {
        const db = await open();
        return reqToPromise(db.transaction(STORE_STATES).objectStore(STORE_STATES).getAll());
      })();
      return all.filter((s) => s.gameId === gameId);
    },
    deleteState(gameId, slot) {
      return tx("readwrite", STORE_STATES, (s) => s.delete(`${gameId}:${slot}`));
    }
  };
})();
