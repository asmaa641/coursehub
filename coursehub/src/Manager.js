import { auth, db } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
const handleError = (context, error) => {
  console.error(`[${context}]`, error);
  throw new Error(`${context} failed: ${error.message}`);
};
const createUserDoc = async (uid, email, name) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    name: name || "Anonymous",
    email,
    role: "student",
    registeredAt: serverTimestamp(),
    followedCourses: [],
    contributions: [],
    pendingContributions: [],
    downloads: [],
    notifications: [],
    points: 0,
    visibility: {
      name: true,
      email: false,
      followedCourses: false,
      contributions: false,
      pendingContributions: false,
      downloads: false,
      notifications: false,
      points: false
    }
  });
};
const saveUserIfNotExists = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) await createUserDoc(user.uid, user.email, user.displayName);
  } catch (error) {
    handleError("saveUserIfNotExists", error);
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
    handleError("signInWithGoogle", error);
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
    await createUserDoc(user.uid, email, displayName);
    return user;
  } catch (error) {
    handleError("signupWithEmail", error);
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
    handleError("loginWithEmail", error);
  }
};
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    handleError("logout", error);
  }
};
export const updateUserProfile = async (uid, { name, email, visibility }) => {
  try {
    const userRef = doc(db, "users", uid);
    const updateData = {};
    if (name) updateData.name = name;
    if (visibility) updateData.visibility = visibility;
    await updateDoc(userRef, updateData);
    if (auth.currentUser) {
      if (name) await updateProfile(auth.currentUser, { displayName: name });
      if (email) await updateEmail(auth.currentUser, email); 
    }
  } catch (error) {
    handleError("updateUserProfile", error);
  }
};
export const followCourse = async (uid, courseId) => {
  try {
    if (!uid || !courseId) throw new Error("Missing uid or courseId");
    await updateDoc(doc(db, "users", uid), { followedCourses: arrayUnion(courseId) });
  } catch (error) {
    handleError("followCourse", error);
  }
};
export const uploadMaterial = async (uid, courseId, title, fileUrl) => {
  try {
    const materialRef = doc(collection(db, "materials"));
    const materialData = {
      uploaderUid: uid,
      courseId,
      title,
      fileUrl,
      approved: false,
      uploadedAt: serverTimestamp()
    };
    await setDoc(materialRef, materialData);
    await updateDoc(doc(db, "users", uid), {
      pendingContributions: arrayUnion({ materialId: materialRef.id, courseId, title, uploadedAt: serverTimestamp() })
    });
    return materialRef.id;
  } catch (error) {
    handleError("uploadMaterial", error);
  }
};
export const approveMaterial = async (adminUid, materialId) => {
  try {
    const materialRef = doc(db, "materials", materialId);
    await runTransaction(db, async (transaction) => {
      const materialSnap = await transaction.get(materialRef);
      if (!materialSnap.exists()) throw new Error("Material not found");
      const material = materialSnap.data();
      if (material.approved) return;
      transaction.update(materialRef, {
        approved: true,
        approvedBy: adminUid,
        approvedAt: serverTimestamp()
      });
      const uploaderRef = doc(db, "users", material.uploaderUid);
      const uploaderSnap = await transaction.get(uploaderRef);
      if (!uploaderSnap.exists()) return;
      const uploaderData = uploaderSnap.data();
      const pending = uploaderData.pendingContributions || [];
      const updatedPending = pending.filter(c => c.materialId !== materialId);
      transaction.update(uploaderRef, {
        contributions: arrayUnion({
          materialId,
          courseId: material.courseId,
          approvedAt: serverTimestamp()
        }),
        pendingContributions: updatedPending,
        points: increment(20)
      });
    });
    const materialSnap = await getDoc(materialRef);
    const materialData = materialSnap.data();
    if (!materialData) return;
    const usersQuery = query(
      collection(db, "users"),
      where("followedCourses", "array-contains", materialData.courseId)
    );
    const usersSnap = await getDocs(usersQuery);
    const batch = writeBatch(db);
    for (const userDoc of usersSnap.docs) {
      const userRef = doc(db, "users", userDoc.id);
      batch.update(userRef, {
        notifications: arrayUnion({
          message: `New material "${materialData.title}" approved in course ${materialData.courseId}.`,
          seen: false,
          timestamp: serverTimestamp()
        })
      });
    }
    await batch.commit();
  } catch (error) {
    handleError("approveMaterial", error);
  }
};
export const addDownload = async (uid, materialId, courseId) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      downloads: arrayUnion({ materialId, courseId, dateDownloaded: serverTimestamp() })
    });
  } catch (error) {
    handleError("addDownload", error);
  }
};
export const addNotification = async (uid, message) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      notifications: arrayUnion({ message, seen: false, timestamp: serverTimestamp() })
    });
  } catch (error) {
    handleError("addNotification", error);
  }
};