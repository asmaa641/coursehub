import { useEffect, useMemo, useState } from "react";
import { getAll, subscribe, update, removeById, getStats } from "../data/uploadsStore.JS";

const STATUS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function Admin() {
  const [uploads, setUploads] = useState(getAll());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("pending");
  const [type, setType] = useState("all");
  const [busy, setBusy] = useState(null);

  useEffect(() => subscribe(setUploads), []);

  const stats = getStats();

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return uploads.filter(u => {
      const okStatus = status === "all" || u.status === status;
      const okType = type === "all" || u.type === type;
      const text = `${u.title} ${u.courseId} ${u.type} ${u.uploaderEmail || ""}`.toLowerCase();
      const okSearch = !s || text.includes(s);
      return okStatus && okType && okSearch;
    });
  }, [uploads, q, status, type]);

  const doApprove = async (id) => { setBusy(id); update(id, { status: "approved", approvedAt: Date.now() }); setBusy(null); };
  const doReject  = async (id) => {
    const reason = prompt("Reason for rejection? (optional)") || null;
    setBusy(id); update(id, { status: "rejected", rejectReason: reason }); setBusy(null);
  };
  const doDelete  = async (id) => {
    if (!confirm("Delete this upload? This is local only and cannot be undone.")) return;
    setBusy(id); removeById(id); setBusy(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Admin — Approvals & Stats</h1>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Users" value={stats.users} />
        <Stat label="Uploads" value={stats.totalUploads} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Approved" value={stats.approved} />
        <Stat label="Downloads" value={stats.totalDownloads} />
      </div>

      {/* Controls */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <input
          value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Search title, course, uploader…"
          className="rounded-lg px-3 py-2 bg-white dark:bg-neutral-800
                     text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700"
        />
        <select
          value={status} onChange={e=>setStatus(e.target.value)}
          className="rounded-lg px-3 py-2 bg-white dark:bg-neutral-800
                     text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700"
        >
          {STATUS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={type} onChange={e=>setType(e.target.value)}
          className="rounded-lg px-3 py-2 bg-white dark:bg-neutral-800
                     text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700"
        >
          <option value="all">All types</option>
          <option value="past-paper">Past papers</option>
          <option value="lecture">Lectures</option>
          <option value="notes">Notes</option>
        </select>
      </div>

      {/* List */}
      <div className="mt-4 grid gap-3">
        {filtered.map(u => (
          <article key={u.id}
            className="rounded-xl p-4 bg-white dark:bg-neutral-900
                       border border-slate-200 dark:border-neutral-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  {u.title}
                  <StatusBadge status={u.status} />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Course: <b>{u.courseId}</b> • Type: {u.type} {u.year ? `• ${u.year}` : ""} • {u.format?.toUpperCase()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Size: {u.sizeMB} MB • Uploader: {u.uploaderEmail || u.uploaderId || "anon"} • ⬇ {u.downloads || 0}
                </div>
              </div>

              <div className="flex gap-2">
                {u.url && (
                  <a href={u.url} target="_blank" rel="noreferrer"
                     className="px-3 py-1.5 rounded-lg border text-sm
                                border-slate-300 dark:border-neutral-700
                                text-slate-700 dark:text-slate-200">
                    Preview
                  </a>
                )}
                {u.status !== "approved" && (
                  <button disabled={busy===u.id}
                          onClick={()=>doApprove(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm disabled:opacity-60">
                    {busy===u.id ? "…" : "Approve"}
                  </button>
                )}
                {u.status !== "rejected" && (
                  <button disabled={busy===u.id}
                          onClick={()=>doReject(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm disabled:opacity-60">
                    {busy===u.id ? "…" : "Reject"}
                  </button>
                )}
                <button disabled={busy===u.id}
                        onClick={()=>doDelete(u.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm disabled:opacity-60">
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}

        {!filtered.length && (
          <div className="text-slate-500 dark:text-slate-400">No uploads found.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
function StatusBadge({ status }) {
  const map = {
    pending:  "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    rejected: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${map[status] || ""}`}>
      {status}
    </span>
  );
}
