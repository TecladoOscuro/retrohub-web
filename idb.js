// Envoltorio mínimo de IndexedDB para ROMs.
const RetroDB = (() => {
  const DB_NAME = "retrohub-web";
  const STORE = "roms";

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function tx(mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const store = t.objectStore(STORE);
      const result = fn(store);
      t.oncomplete = () => resolve(result);
      t.onerror = () => reject(t.error);
    });
  }

  return {
    add(rom) { // {name, console, blob}
      return tx("readwrite", (s) => s.add(rom));
    },
    async all() {
      const db = await open();
      return new Promise((resolve, reject) => {
        const req = db.transaction(STORE).objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },
    async get(id) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const req = db.transaction(STORE).objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },
    remove(id) {
      return tx("readwrite", (s) => s.delete(id));
    }
  };
})();
