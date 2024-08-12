import "./chats.css";

// Component imports
import AddUserModal from "../add-user-modal/AddUserModal";

// Other imports
import { useUserStore } from "../../../lib/userStore";
import { useEffect, useState } from "react";
import { firestoreDB } from "../../../lib/firebase-config";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../../lib/chatStore";
import { toast } from "react-toastify";

const Chats = () => {
  const [searchedChatPreview, setSearchedChatPreview] = useState("");
  const [shouldAddUser, setShouldAddUser] = useState(false);
  const [chatPreviews, setChatPreviews] = useState([]);

  const { currentUserInfo } = useUserStore();
  const { establishConnection } = useChatStore();

  // Get realtime chat-previews for the current user
  useEffect(() => {
    const unsub = onSnapshot(
      doc(firestoreDB, "userChats", currentUserInfo.id),
      async (response) => {
        const chatItems = response.data().chats;

        const chatPreviewPromises = chatItems.map(async (chatItem) => {
          // Here 'friend' refers to the user who is connected to the current user
          const friendDocRef = doc(firestoreDB, "users", chatItem.receiverId);

          const friendDocSnap = await getDoc(friendDocRef);

          const friendInfo = friendDocSnap.data();

          return { ...chatItem, friendInfo };
        });

        const chatPreviewItems = await Promise.all(chatPreviewPromises);

        setChatPreviews(
          chatPreviewItems.sort(
            (chat1, chat2) => chat2.updatedAt - chat1.updatedAt
          )
        );
      }
    );

    return () => unsub();
  }, [currentUserInfo.id]);

  // Handle current user's chat item (preview) selection
  const handleChatSelection = async (chat) => {
    const friendChats = chatPreviews.map((chatPreview) => {
      const { friendInfo, ...chatItem } = chatPreview;

      return chatItem;
    });

    const selectedChatIndex = friendChats.findIndex(
      (friendChat) => friendChat.chatId === chat.chatId
    );

    friendChats[selectedChatIndex].isSeen = true;

    const userChatsDocRef = doc(firestoreDB, "userChats", currentUserInfo.id);

    try {
      await updateDoc(userChatsDocRef, {
        chats: friendChats,
      });

      establishConnection(chat.chatId, chat.friendInfo);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // Filter chat previews by username
  const filteredChatPreviews = chatPreviews.filter((chatPreview) =>
    chatPreview.friendInfo.username
      .toLowerCase()
      .includes(searchedChatPreview.toLowerCase())
  );

  return (
    <div className="chats">
      <div className="search-field">
        <div className="search-bar">
          <img
            src="/search.png"
            alt="Search icon"
            title="Search"
            role="button"
            aria-label="Search for a Breeze"
            tabIndex={0}
          />

          <input
            type="text"
            placeholder="Find Breeze"
            aria-label="Start typing a breezer's username to find the respective breeze"
            onChange={(event) =>
              setSearchedChatPreview(event.target.value.trim())
            }
          />
        </div>

        <img
          src={shouldAddUser ? "/minus.png" : "/plus.png"}
          alt="Add user icon"
          onClick={() => setShouldAddUser((prevVal) => !prevVal)}
          className="add-user-icon"
          title="Add a new breezer"
          role="button"
          aria-label="Click to add a new breezer"
          tabIndex={0}
        />
      </div>

      {filteredChatPreviews.map((chatPreview) => (
        <div
          key={chatPreview.chatId}
          className="chat-item"
          role="button"
          aria-label="Click to start a breeze"
          tabIndex={0}
          onClick={() => handleChatSelection(chatPreview)}
          style={{
            color: chatPreview.isSeen ? "white" : "#5183fe",
          }}
        >
          <img
            src={
              chatPreview.friendInfo.blockedUsers.includes(currentUserInfo.id)
                ? "/avatar.png"
                : chatPreview.friendInfo.avatar || "/avatar.png"
            }
            alt="User avatar"
          />

          <div className="contents">
            <span>
              {chatPreview.friendInfo.blockedUsers.includes(currentUserInfo.id)
                ? "Breezer"
                : chatPreview.friendInfo.username}
            </span>

            <p>
              {chatPreview.lastMessage.length > 30
                ? `${chatPreview.lastMessage.slice(0, 29)}...`
                : chatPreview.lastMessage}
            </p>
          </div>
        </div>
      ))}

      {shouldAddUser && <AddUserModal chatPreviews={chatPreviews} />}
    </div>
  );
};

export default Chats;
