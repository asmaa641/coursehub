import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import SignInCard from "../components/SignInCard";
import { logout, updateUserProfile } from "../Manager";

export default function ProfilePage() {
  const { user, userDoc, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) setDisplayName(user.displayName || "");
  }, [user]);

  if (loading) return <div className="p-6 text-slate-400">Checking sign-in…</div>;
  if (!user) return <SignInCard />;

  async function handleSave() {
    try {
      setErr("");
      setSaving(true);
      await updateUserProfile(user.uid, { name: displayName });
    } catch (e) {
      setErr(e.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-semibold">Your profile</h1>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex items-center gap-4">
          <img
            src={
              user.photoURL ||
              `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.email || "U")}`
            }
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover border border-slate-700"
          />
          <div className="text-sm text-slate-400">
            <div>{user.email}</div>
            <div>Points: {userDoc?.points ?? 0}</div>
          </div>
        </div>

        <label className="block mt-4 text-sm text-slate-300">Display name</label>
        <input
          className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-2 rounded-md bg-sky-500 hover:bg-sky-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => logout()}
            className="px-3 py-2 rounded-md border border-slate-700 hover:border-slate-500"
          >
            Sign out
          </button>
        </div>

        {err && <div className="mt-2 text-rose-400 text-sm">{err}</div>}
      </div>
    </div>
  );
}
