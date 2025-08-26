import { auth, db } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const saveUserIfNotExists = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Anonymous",
      email: user.email,
      role: "student",
      registeredAt: new Date()
    });
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.email.endsWith("@aucegypt.edu")) {
      await signOut(auth);
      throw new Error("You must sign in with your AUC email!");
    }

    await saveUserIfNotExists(user);
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
    throw error;
  }
};

export const signupWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (!user.email.endsWith("@aucegypt.edu")) {
      await signOut(auth);
      throw new Error("You must use an AUC email!");
    }

    await setDoc(doc(db, "users", user.uid), {
      name: displayName,
      email: user.email,
      role: "student",
      registeredAt: new Date()
    });

    return user;
  } catch (error) {
    console.error("Signup Error:", error.message);
    throw error;
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (!user.email.endsWith("@aucegypt.edu")) {
      await signOut(auth);
      throw new Error("You must use an AUC email!");
    }

    await saveUserIfNotExists(user);
    return user;
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
