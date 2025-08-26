import { useEffect, useState } from "react";
import { db } from "./firebase"; 
import { collection, getDocs } from "firebase/firestore";

function App() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, "test"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocs(data);
      } catch (err) {
        console.error("Error fetching Firestore data:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔥 Firebase Firestore Test</h1>
      {docs.length > 0 ? (
        <ul>
          {docs.map((doc) => (
            <li key={doc.id}>
              <strong>{doc.id}:</strong> {JSON.stringify(doc)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data yet. Add a doc in Firestore → Collection: <b>test</b></p>
      )}
    </div>
  );
}

export default App;