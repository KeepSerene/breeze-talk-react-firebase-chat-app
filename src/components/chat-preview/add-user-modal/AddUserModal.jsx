import "./add-user-modal.css";

import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestoreDB } from "../../../lib/firebase-config";
import { toast } from "react-toastify";
import { useRef, useState } from "react";
import { useUserStore } from "../../../lib/userStore";

const AddUserModal = ({ chatPreviews }) => {
  const [searchedUserInfo, setSearchedUserInfo] = useState(null);

  const searchInputElemRef = useRef(null);

  const { currentUserInfo } = useUserStore();

  const handleSearch = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = formData.get("username");

    try {
      const usersCollectionRef = collection(firestoreDB, "users");

      // Create a query against the collection
      const queryResult = query(
        usersCollectionRef,
        where("username", "==", username)
      );
      const querySnapshot = await getDocs(queryResult);

      if (!querySnapshot.empty) {
        setSearchedUserInfo(querySnapshot.docs[0].data());

        searchInputElemRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleAddingUser = async () => {
    // Check to see if the current user has already added the searched user
    const isAlreadyFriend = chatPreviews.some((chatPreview) => {
      if (chatPreview.friendInfo.id === searchedUserInfo.id) {
        toast.warn(
          `You are already Breezies with "${searchedUserInfo.username}".`
        );

        return true;
      }

      return false;
    });

    if (isAlreadyFriend) return;

    const userChatsCollectionRef = collection(firestoreDB, "userChats");

    // The 'chats' collection
    const chatsCollectionRef = collection(firestoreDB, "chats");

    try {
      const chatsDocRef = doc(chatsCollectionRef);

      // Create a new chat document under the 'chats' collection to obtain a chat ID
      await setDoc(chatsDocRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Update searched user chats by pushing the previously created 'chat' document into the associated 'userChats' collection against the obtained chat ID
      await updateDoc(doc(userChatsCollectionRef, searchedUserInfo.id), {
        chats: arrayUnion({
          chatId: chatsDocRef.id,
          lastMessage: "",
          receiverId: currentUserInfo.id,
          updatedAt: Date.now(),
        }),
      });

      // Update current user chats by pushing the previously created 'chat' document into the associated 'userChats' collection against the obtained chat ID
      await updateDoc(doc(userChatsCollectionRef, currentUserInfo.id), {
        chats: arrayUnion({
          chatId: chatsDocRef.id,
          lastMessage: "",
          receiverId: searchedUserInfo.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="add-user-modal">
      <form onSubmit={handleSearch}>
        <label htmlFor="search-user" className="sr-only">
          Look for a breezer by their username
        </label>

        <input
          type="text"
          id="search-user"
          name="username"
          placeholder="Search by username"
          ref={searchInputElemRef}
        />

        <button type="submit">Search</button>
      </form>

      {searchedUserInfo && (
        <div className="user">
          <div className="details">
            <img
              src={searchedUserInfo.avatar || "/avatar.png"}
              alt="User avatar"
            />

            <span>{searchedUserInfo.username}</span>
          </div>

          <button type="button" onClick={handleAddingUser}>
            Add Breezer
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUserModal;
