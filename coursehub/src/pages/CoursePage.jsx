import { useParams } from "react-router-dom";

export default function CoursePage() {
  const { id } = useParams();
  return (
    <div style={{ padding: 20 }}>
      <h2>Course: {id || "missing id"}</h2>
    </div>
  );
}