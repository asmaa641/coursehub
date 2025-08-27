import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
// FAKE DATA USED TO TEST THE UI, TO BE REPLACED WITH BACKEND REAL DATA
const initialCourses = [
  { id:"CSCE1001", code:"CSCE 1001", title:"CS I", group:"Level 1", description:"Variables, Functions, c++.", tags:["first-year","programming"], downloads:88 },
  { id:"CSCE2001", code:"CSCE 2001", title:"Data Structures", group:"Level 2", description:"Stacks, queues, trees, graphs.", tags:["core","algorithms"], downloads:172 },
  { id:"CSCE2006", code:"CSCE 2006", title:"Discrete Math", group:"Level 2", description:"Logic, sets, combinatorics, graphs.", tags:["math","core"], downloads:130 },
  { id:"CSCE3001", code:"CSCE 3001", title:"Algorithms", group:"Level 3", description:"Greedy, DP, graph algorithms, complexity.", tags:["algorithms"], downloads:149 },
  { id:"CSCE3300", code:"CSCE 3300", title:"Databases", group:"Level 3", description:"ER models, SQL, normalization, indexing.", tags:["data"], downloads:101 },
  { id:"CSCE3400", code:"CSCE 3400", title:"Computer Architecture", group:"Level 3", description:"CPU, memory hierarchy, assembly basics.", tags:["systems"], downloads:76 },
];

// coursecard +linking coursecard to course page function
function CourseCard({ c }) {
  return (
    <Link
      to={`/course/${c.id}`}
      className="rounded-xl bg-slate-800 p-4 border border-slate-700 hover:border-slate-500 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{c.code} — {c.title}</div>
          <p className="text-slate-300 text-sm mt-1 line-clamp-2">{c.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(c.tags || []).map(t => (
              <span key={t} className="text-xs bg-slate-700 px-2 py-1 rounded">#{t}</span>
            ))}
          </div>
        </div>
        <div className="text-xs text-slate-400 shrink-0">
          <div className="text-slate-500">⬇ {c.downloads}</div>
        </div>
      </div>
    </Link>
  );
}

export default function Home(){ 
// defining a course
     const [courses] = useState(initialCourses);
    const [loading] = useState(false);

    //search implementation
    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return courses;
    return courses.filter(c => {
    const haystack = [
      c.code,            
      c.title,           
      c.description,     
      ...(c.tags || [])  
    ].join(" ").toLowerCase();

    return haystack.includes(s);
  });
}, [courses, q]);

// interface
    return (
    <div>
       <section className="max-w-6xl mx-auto px-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <header>
                     <h1 className="text-4xl font-bold text-slate-700 text-left py-5">Welcome Back!</h1>
                     <h3 className="text-xl text-slate-400 text-left italic">Find materials for your CSCE courses—past papers, lectures, and more. Upload materials to increase your contributor points!</h3>
                </header>
             </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 mt-8">
            <header>
                <h2 className="text-3xl font-bold text-slate-700 py-11">Search for a course</h2>
            </header>
            <input type="search" placeholder='Type Here' className="w-full p-4 rounded-full bg-slate-800 text-white placeholder-slate-400 border border-slate-70
            focus:outline-none focus:ring-2 focus:ring-sky-500" 
            value={q}
            onChange={(e) => setQ(e.target.value)}/>
        </section>
        <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-700">All courses</h2>


        {loading && (
          <div className="mt-3 text-slate-400">Loading courses…</div>
        )}

        {!loading && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(c => <CourseCard key={c.id} c={c} />)}
            {!filtered.length && (
              <div className="col-span-full text-slate-400">
                No courses match your search.
              </div>
            )}
          </div>
        )}
      </section>
    </div>

    
       
    
    )
    
}
