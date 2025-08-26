import { useEffect, useState } from "react";
import { db } from "./firebase"; 
import { collection, getDocs } from "firebase/firestore";
import { Link, NavLink, Outlet } from "react-router-dom";

function App () {
  const nav = ({ isActive }) =>
    "px-3 py-1 rounded-md hover:bg-slate-800 " +
    (isActive ? "text-white" : "text-slate-300");

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800">
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between text-slate-200">
          <Link to="/" className="font-semibold">CSCE Resources</Link>
          <div className="flex gap-2 text-sm">
            <NavLink to="/" end className={nav}>Home</NavLink>
            <NavLink to="/course" className={nav}>Course Page</NavLink>
            <NavLink to="/profilepage" className={nav}>Profile Page</NavLink>
            <NavLink to="/settings" className={nav}>Settings</NavLink>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 text-white">
        {/* Active child route renders here */}
        <Outlet />
      </main>
    </>
  );
}

// function App() {
//   const [docs, setDocs] = useState([]);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const querySnapshot = await getDocs(collection(db, "test"));
//         const data = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setDocs(data);
//       } catch (err) {
//         console.error("Error fetching Firestore data:", err);
//       }
//     }
//     fetchData();
//   }, []);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>🔥 Firebase Firestore Test</h1>
//       {docs.length > 0 ? (
//         <ul>
//           {docs.map((doc) => (
//             <li key={doc.id}>
//               <strong>{doc.id}:</strong> {JSON.stringify(doc)}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No data yet. Add a doc in Firestore → Collection: <b>test</b></p>
//       )}
//     </div>
//   );
// }

export default App;
