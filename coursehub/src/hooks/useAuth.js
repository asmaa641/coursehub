import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function useAuth(){
    const[user, setUser] = useState(null); // storing current auth user
    const[userDoc, setUserDoc] = useState(null); // storing the profile doc data 
    const[loading, setLoading] = useState(true); // page will show a spinner that prevents the UI flickers

    useEffect(() => {
        const offAuth = onAuthStateChanged(auth, (u)=>{
            setUser(u)
            if(!u){
                setUserDoc(null);
                setLoading(false);
                return;
            }
            const ref = doc(db, "users", uid);
            const offDoc = onSnapshot(ref,(snap) =>{
                setUserDoc(snap.exists() ? {id: snap.id, ...snap.data()} : null);
                setLoading(false);
            },
            (err)=>{
                console.error("user doc subscription:", err);
                setLoading(false);
            }
        );
        return offDoc;
        });
        return () => offAuth();
    }, []);
    return{ user, userDoc, loading };
}