import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";

/**
 * TEMP DATA — replace with Firestore later.
 * Make sure the IDs match what you use in Home cards (e.g., "CSCE2001").
 */
const COURSES = {
  CSCE1001: {
    code: "CSCE 1001",
    title: "CS I",
    description: "Variables, functions, C++ basics.",
    materials: [
      { id: "m1", title: "Fall 2023 Midterm", type: "past-paper", year: 2023, format: "pdf", sizeMB: 1.3, downloads: 82, url: "#" },
      { id: "m2", title: "Week 1 – Variables (Lecture)", type: "lecture", year: 2024, format: "mp4", sizeMB: 120, downloads: 140, url: "#" },
      { id: "m3", title: "Lab 02 Solutions", type: "notes", year: 2024, format: "pdf", sizeMB: 0.6, downloads: 40, url: "#" },
    ],
  },
  CSCE2001: {
    code: "CSCE 2001",
    title: "Data Structures",
    description: "Stacks, queues, trees, graphs.",
    materials: [
      { id: "m1", title: "Spring 2024 Final", type: "past-paper", year: 2024, format: "pdf", sizeMB: 2.1, downloads: 172, url: "#" },
      { id: "m2", title: "Trees & BSTs (Lecture)", type: "lecture", year: 2024, format: "mp4", sizeMB: 180, downloads: 96, url: "#" },
      { id: "m3", title: "Graphs Cheatsheet", type: "notes", year: 2023, format: "pdf", sizeMB: 0.8, downloads: 65, url: "#" },
      { id: "m4", title: "Stacks & Queues Worksheet", type: "notes", year: 2024, format: "pdf", sizeMB: 0.9, downloads: 51, url: "#" },
    ],
  },
  CSCE2006: {
    code: "CSCE 2006",
    title: "Discrete Math",
    description: "Logic, sets, combinatorics, graphs.",
    materials: [
      { id: "m1", title: "Combinatorics Review", type: "notes", year: 2023, format: "pdf", sizeMB: 0.7, downloads: 44, url: "#" },
      { id: "m2", title: "Spring 2024 Quiz 2", type: "past-paper", year: 2024, format: "pdf", sizeMB: 0.5, downloads: 33, url: "#" },
    ],
  },
  CSCE3001: {
    code: "CSCE 3001",
    title: "Algorithms",
    description: "Greedy, DP, graph algorithms.",
    materials: [
      { id: "m1", title: "DP Master Sheet", type: "notes", year: 2024, format: "pdf", sizeMB: 0.9, downloads: 149, url: "#" },
      { id: "m2", title: "Spring 2024 Final", type: "past-paper", year: 2024, format: "pdf", sizeMB: 1.2, downloads: 91, url: "#" },
    ],
  },
  CSCE3300: {
    code: "CSCE 3300",
    title: "Databases",
    description: "ER, SQL, normalization, indexing.",
    materials: [
      { id: "m1", title: "SQL Practice Set", type: "notes", year: 2023, format: "pdf", sizeMB: 0.8, downloads: 58, url: "#" },
      { id: "m2", title: "Spring 2024 Midterm", type: "past-paper", year: 2024, format: "pdf", sizeMB: 1.0, downloads: 101, url: "#" },
    ],
  },
  CSCE3400: {
    code: "CSCE 3400",
    title: "Computer Architecture",
    description: "CPU, memory hierarchy, assembly.",
    materials: [
      { id: "m1", title: "Caches Deep Dive (Lecture)", type: "lecture", year: 2024, format: "mp4", sizeMB: 210, downloads: 42, url: "#" },
      { id: "m2", title: "Fall 2023 Final", type: "past-paper", year: 2023, format: "pdf", sizeMB: 1.5, downloads: 76, url: "#" },
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

export default function CoursePage() {
  const { id } = useParams();
  const course = COURSES[id];

  // page state
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("popular");

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
    let list = course.materials.filter(m => {
      const okType = type === "all" || m.type === type;
      const okSearch =
        !s ||
        `${m.title} ${m.type} ${m.year} ${m.format}`.toLowerCase().includes(s);
      return okType && okSearch;
    });

    list.sort((a, b) => {
      if (sort === "popular") return b.downloads - a.downloads;
      if (sort === "newest") return (b.year ?? 0) - (a.year ?? 0);
      if (sort === "name") return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [course.materials, q, type, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
        <Link to="/" className="hover:underline">Courses</Link>
        <span className="mx-2">/</span>
        <span>{course.code}</span>
      </div>

      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {course.code} — {course.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
      </header>

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
                <div className="font-semibold text-slate-900 dark:text-white">{m.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <span className="mr-3 capitalize">{m.type.replace("-", " ")}</span>
                  <span className="mr-3">{m.year}</span>
                  <span className="uppercase">{m.format}</span>
                  <span className="ml-3 text-slate-500 dark:text-slate-500">{m.sizeMB} MB</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">⬇ {m.downloads}</div>
                {/* For now href="#" — replace with Firebase Storage URL later */}
                <a
                  href={m.url}
                  className="inline-block text-sm px-3 py-1.5 rounded-lg
                             bg-sky-500 hover:bg-sky-600 text-white"
                >
                  Download
                </a>
              </div>
            </div>
          </article>
        ))}

        {!filtered.length && (
          <div className="text-slate-500 dark:text-slate-400">No materials match your filters.</div>
        )}
      </div>
    </div>
  );
}
