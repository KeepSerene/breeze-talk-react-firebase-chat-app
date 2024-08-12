import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { firestoreDB } from "./firebase-config";

// Zustand store
export const useUserStore = create((set) => ({
  currentUserInfo: null,
  isLoading: true,

  // A custom action
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUserInfo: null, isLoading: false });

    try {
      const userDocRef = doc(firestoreDB, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        set({ currentUserInfo: userDocSnap.data(), isLoading: false });
      } else {
        set({ currentUserInfo: null, isLoading: false });
      }
    } catch (err) {
      console.error(err);

      return set({ currentUserInfo: null, isLoading: true });
    }
  },
}));
