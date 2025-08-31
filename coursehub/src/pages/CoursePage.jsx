// src/pages/CoursePage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

/** TEMP in-memory data (no backend) */
const COURSES = {
  CSCE1001: {
    code: "CSCE 1001",
    title: "CS I",
    description: "Variables, functions, C++ basics.",
    materials: [
      { id: "m1", title: "Fall 2023 Midterm", type: "past-paper", year: 2023, format: "pdf", sizeMB: 1.3, downloads: 82, url: "#", status: "approved" },
      { id: "m2", title: "Week 1 – Variables (Lecture)", type: "lecture", year: 2024, format: "mp4", sizeMB: 120, downloads: 140, url: "#", status: "approved" },
    ],
  },
  CSCE2001: {
    code: "CSCE 2001",
    title: "Data Structures",
    description: "Stacks, queues, trees, graphs.",
    materials: [
      { id: "m1", title: "Spring 2024 Final", type: "past-paper", year: 2024, format: "pdf", sizeMB: 2.1, downloads: 172, url: "#", status: "approved" },
      { id: "m2", title: "Trees & BSTs (Lecture)", type: "lecture", year: 2024, format: "mp4", sizeMB: 180, downloads: 96, url: "#", status: "approved" },
    ],
  },
  CSCE2006: {
    code: "CSCE 2006",
    title: "Discrete Math",
    description: "Logic, sets, combinatorics, graphs.",
    materials: [
      { id: "m1", title: "Combinatorics Review", type: "notes", year: 2023, format: "pdf", sizeMB: 0.7, downloads: 44, url: "#", status: "approved" },
    ],
  },
  CSCE3001: {
    code: "CSCE 3001",
    title: "Algorithms",
    description: "Greedy, DP, graph algorithms.",
    materials: [
      { id: "m1", title: "DP Master Sheet", type: "notes", year: 2024, format: "pdf", sizeMB: 0.9, downloads: 149, url: "#", status: "approved" },
    ],
  },
  CSCE3300: {
    code: "CSCE 3300",
    title: "Databases",
    description: "ER, SQL, normalization, indexing.",
    materials: [
      { id: "m1", title: "SQL Practice Set", type: "notes", year: 2023, format: "pdf", sizeMB: 0.8, downloads: 58, url: "#", status: "approved" },
      { id: "m2", title: "Spring 2024 Midterm", type: "past-paper", year: 2024, format: "pdf", sizeMB: 1.0, downloads: 101, url: "#", status: "approved" },
    ],
  },
  CSCE3400: {
    code: "CSCE 3400",
    title: "Computer Architecture",
    description: "CPU, memory hierarchy, assembly.",
    materials: [
      { id: "m1", title: "Caches Deep Dive (Lecture)", type: "lecture", year: 2024, format: "mp4", sizeMB: 210, downloads: 42, url: "#", status: "approved" },
    ],
  },
};

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "past-paper", label: "Past papers" },
  { value: "lecture", label: "Lectures" },
  { value: "notes", label: "Notes" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most downloaded" },
  { value: "newest", label: "Newest (year)" },
  { value: "name", label: "Name (A→Z)" },
];

/** --- Upload Modal (frontend-only) --- */
function UploadModal({ open, onClose, courseId }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("past-paper");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle(""); setType("past-paper"); setYear(""); setFile(null);
      setBusy(false); setError("");
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!file || !title) { setError("Title and file are required."); return; }

    setBusy(true);
    // No backend: create a local object URL for preview, mark as pending
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const objUrl = URL.createObjectURL(file);

    const newItem = {
      id: "tmp-" + Date.now(),
      title,
      type,
      year: year ? Number(year) : null,
      format: ext || "file",
      sizeMB: +(file.size / 1e6).toFixed(2),
      downloads: 0,
      url: objUrl,         // only works this session
      status: "pending",   // show a badge in the list
      fileName: file.name,
      courseId,
      owner: true,
      uploaderId: "local",        // <-- helps stats
      uploaderEmail: "local@demo"
    };
   const storeItem = {
 id: uiItem.id,
   title: uiItem.title,
   type: uiItem.type,
   year: uiItem.year,
   format: uiItem.format,
   sizeMB: uiItem.sizeMB,
   downloads: 0,
   status: "pending",
   courseId,
   uploaderId: "local",
  uploaderEmail: "local@demo",
   createdAt: Date.now(),
 };
 addUpload(storeItem);
    setBusy(false);
    onClose(true, uiItem);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <form onSubmit={onSubmit}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upload material</h3>

        <label className="block mt-4 text-sm text-slate-700 dark:text-slate-300">
          Title
          <input
            className="mt-1 w-full rounded-lg px-3 py-2 bg-white dark:bg-neutral-800
                       text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700"
            value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g., Spring 2024 Final"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Type
            <select
              className="mt-1 w-full rounded-lg px-3 py-2 bg-white dark:bg-neutral-800
                         text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700"
              value={type} onChange={(e)=>setType(e.target.value)}
            >
              <option value="past-paper">Past paper</option>
              <option value="lecture">Lecture</option>
              <option value="notes">Notes</option>
            </select>
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Year
            <input
              type="number" min="2000" max="2100"
              className="mt-1 w-full rounded-lg px-3 py-2 bg-white dark:bg-neutral-800
                         text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700"
              value={year} onChange={(e)=>setYear(e.target.value)} placeholder="2024"
            />
          </label>
        </div>

        <label className="block mt-4 text-sm text-slate-700 dark:text-slate-300">
          File (PDF, MP4, etc.)
          <input
            type="file" accept=".pdf,.mp4,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border
                       file:border-slate-300 dark:file:border-neutral-700
                       file:bg-white dark:file:bg-neutral-800
                       file:px-3 file:py-2 file:text-slate-900 dark:file:text-white"
            onChange={(e)=>setFile(e.target.files?.[0] || null)}
          />
        </label>

        {!!error && <div className="mt-3 text-sm text-rose-500">{error}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button"
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700
                       text-slate-700 dark:text-slate-200"
            onClick={()=>onClose(false)}
            disabled={busy}
          >Cancel</button>
          <button type="submit"
            className="px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-60"
            disabled={busy}
          >{busy ? "Uploading…" : "Submit"}</button>
        </div>
      </form>
    </div>
  );
}

/** --- Main page --- */
export default function CoursePage() {
  const { id } = useParams();
  const course = COURSES[id];

  const deleteMaterial = (id) => {
  setMaterials((arr) => {
    const item = arr.find(x => x.id === id);
    // free the object URL if it was created for preview
    if (item?.url?.startsWith("blob:")) {
      try { URL.revokeObjectURL(item.url); } catch {}
    }
    return arr.filter(x => x.id !== id);
  });
};


  // keep materials in state so uploads append locally
  const [materials, setMaterials] = useState(course?.materials || []);
  useEffect(() => {
    // reset when course changes; mark initial as approved
    const base = (COURSES[id]?.materials || []).map(m => ({ status: m.status || "approved", ...m }));
    setMaterials(base);
  }, [id]);

  // controls
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("popular");
  const [showUpload, setShowUpload] = useState(false);

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-slate-600 dark:text-slate-300">Course not found.</p>
        <Link to="/" className="text-sky-500 hover:underline">← Back to courses</Link>
      </div>
    );
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    let list = materials.filter(m => {
      const okType = type === "all" || m.type === type;
      const okSearch =
        !s ||
        `${m.title} ${m.type} ${m.year} ${m.format}`.toLowerCase().includes(s);
      return okType && okSearch;
    });

    list.sort((a, b) => {
      if (sort === "popular") return (b.downloads || 0) - (a.downloads || 0);
      if (sort === "newest") return (b.year ?? 0) - (a.year ?? 0);
      if (sort === "name") return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [materials, q, type, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
        <Link to="/" className="hover:underline">Courses</Link>
        <span className="mx-2">/</span>
        <span>{course.code}</span>
      </div>

      {/* Header + Upload */}
      <div className="mb-4 flex items-start justify-between">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {course.code} — {course.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
        </header>

        <button
          onClick={()=>setShowUpload(true)}
          className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
        >
          ⬆ Upload
        </button>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search materials…"
          className="rounded-lg px-3 py-2
                     bg-white dark:bg-neutral-800
                     text-slate-900 dark:text-white
                     placeholder-slate-400
                     border border-slate-300 dark:border-neutral-700
                     focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg px-3 py-2 bg-white dark:bg-neutral-800
                     text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700"
        >
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg px-3 py-2 bg-white dark:bg-neutral-800
                     text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Materials */}
      <div className="grid gap-3">
        {filtered.map(m => (
          <article
            key={m.id}
            className="rounded-xl p-4 bg-white dark:bg-neutral-900
                       border border-slate-200 dark:border-neutral-800
                       hover:border-slate-400 dark:hover:border-neutral-600
                       transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  {m.title}
                  {m.status === "pending" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Pending
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <span className="mr-3 capitalize">{m.type.replace("-", " ")}</span>
                  {m.year && <span className="mr-3">{m.year}</span>}
                  <span className="uppercase">{m.format}</span>
                  <span className="ml-3 text-slate-500 dark:text-slate-500">{m.sizeMB} MB</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">⬇ {m.downloads || 0}</div>
                {m.status === "approved" ? (
                  <a
                    href={m.url || "#"}
                    className="inline-block text-sm px-3 py-1.5 rounded-lg
                               bg-sky-500 hover:bg-sky-600 text-white"
                    target="_blank" rel="noreferrer"
                  >
                    Download
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-block text-sm px-3 py-1.5 rounded-lg
                               bg-slate-300 dark:bg-neutral-700 text-slate-600 dark:text-slate-300 cursor-not-allowed"
                  >
                    Awaiting approval
                  </button>
                )}
                {m.owner && (
  <button
   onClick={() => {
     if (confirm(`Delete “${m.title}”? This cannot be undone (frontend only).`)) {
        deleteMaterial(m.id);
      }
    }}
    className="ml-2 inline-block text-sm px-3 py-1.5 rounded-lg
               bg-rose-500 hover:bg-rose-600 text-white"
  >
    Delete
  </button>
 )}
              </div>
            </div>
          </article>
        ))}

        {!filtered.length && (
          <div className="text-slate-500 dark:text-slate-400">No materials match your filters.</div>
        )}
      </div>

      {/* Upload modal */}
      <UploadModal
        open={showUpload}
        onClose={(ok, newItem) => {
          setShowUpload(false);
          if (ok && newItem) setMaterials((arr) => [...arr, newItem]);
        }}
        courseId={id}
      />
    </div>
  );
}
