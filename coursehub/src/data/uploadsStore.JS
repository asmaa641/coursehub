// THIS WILL BE REPLACE WITH FIREBASE/STORAGE CALLS

const KEY = "coursehub_uploads_v1";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function write(list) {
  try {
    // keep last 500 items max to avoid huge payloads
    const slim = list.slice(-500);
    localStorage.setItem(KEY, JSON.stringify(slim));
    window.dispatchEvent(new CustomEvent("uploads-changed"));
  } catch (e) {
    console.warn("Local store write failed:", e);
    alert("Local storage is full. I won’t persist this upload, but it will still appear in the list for this session.");
  }
}
export function getAll() { return read(); }

export function add(item) {
  const list = read();
  list.push(item);
  write(list);
}
export function update(id, patch) {
  const list = read().map(it => it.id === id ? { ...it, ...patch } : it);
  write(list);
}
export function removeById(id) {
  const list = read().filter(it => it.id !== id);
  write(list);
}

export function subscribe(cb) {
  const handler = () => cb(read());
  window.addEventListener("uploads-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("uploads-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

export function getStats() {
  const list = read();
  const totalUploads = list.length;
  const pending = list.filter(x => x.status === "pending").length;
  const approved = list.filter(x => x.status === "approved").length;
  const rejected = list.filter(x => x.status === "rejected").length;
  const totalDownloads = list.reduce((s, x) => s + (x.downloads || 0), 0);

  // crude unique users (by uploaderId or email; fallback "anon")
  const users = new Set(
    list.map(x => x.uploaderId || x.uploaderEmail || "anon")
  ).size;

  return { totalUploads, pending, approved, rejected, totalDownloads, users };
}
