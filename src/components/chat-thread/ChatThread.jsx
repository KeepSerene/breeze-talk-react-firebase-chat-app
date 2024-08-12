import "./chat-thread.css";

import { useEffect, useRef, useState } from "react";

// Library imports
import { toast } from "react-toastify";
import EmojiPicker from "emoji-picker-react";

// Other imports
import { useChatStore } from "../../lib/chatStore";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { firestoreDB } from "../../lib/firebase-config";
import { useUserStore } from "../../lib/userStore";
import getImageURL from "../../lib/storage-monitor-upload";
import { formatElapsedTime } from "../../utils/utils";

const ChatThread = () => {
  const [shouldOpen, setShouldOpen] = useState(false);
  const [photo, setPhoto] = useState({
    file: null,
    url: "",
  });
  const [inputStr, setInputStr] = useState("");
  const [chatThread, setChatThread] = useState(undefined);

  const scrollIntoViewElemRef = useRef(null);

  const { currentUserInfo } = useUserStore();
  const { chatId, friendInfo, isCurrentUserBlocked, isFriendBlocked } =
    useChatStore();

  // Scroll to the end of the chat thread on mount
  useEffect(() => {
    scrollIntoViewElemRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Retrieve all the messages in the current chat thread whenever the 'chatId' changes
  useEffect(() => {
    const unsub = onSnapshot(doc(firestoreDB, "chats", chatId), (response) =>
      setChatThread(response.data())
    );

    return () => unsub();
  }, [chatId]);

  const handleEmojiSelection = (evt) => {
    setInputStr((prevStr) => prevStr + evt.emoji);

    setShouldOpen(false);
  };

  const sharePhoto = (event) => {
    if (event.target.files[0]) {
      setPhoto({
        file: event.target.files[0],
        url: URL.createObjectURL(event.target.files[0]),
      });
    }
  };

  const sendMessage = async () => {
    if (inputStr.trim() === "") return;

    let photoURL = null;

    if (photo.url) photoURL = await getImageURL(photo.file);

    try {
      await updateDoc(doc(firestoreDB, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUserInfo.id,
          text: inputStr.trim(),
          ...(photoURL && { photo: photoURL }),
          createdAt: new Date(),
        }),
      });

      [currentUserInfo.id, friendInfo.id].forEach(async (userId) => {
        const userChatsDocRef = doc(firestoreDB, "userChats", userId);
        const userChatsDocSnapshot = await getDoc(userChatsDocRef);

        if (userChatsDocSnapshot.exists()) {
          const userChatsDocData = userChatsDocSnapshot.data();

          const currentChatIndex = userChatsDocData.chats.findIndex(
            (chat) => chat.chatId === chatId
          );

          userChatsDocData.chats[currentChatIndex].lastMessage =
            inputStr.trim();
          userChatsDocData.chats[currentChatIndex].isSeen =
            userId === currentUserInfo.id ? true : false;
          userChatsDocData.chats[currentChatIndex].updatedAt = Date.now();

          await updateDoc(userChatsDocRef, {
            chats: userChatsDocData.chats,
          });
        }
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }

    setInputStr("");
    setPhoto({
      file: null,
      url: "",
    });
  };

  return (
    <div className="chat-thread">
      <div className="top-segment">
        <div className="user">
          <img src={friendInfo?.avatar || "/avatar.png"} alt="User avatar" />

          <div className="contents">
            <span>{friendInfo?.username || "Breezer"}</span>

            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </div>

        <div className="icons">
          <img
            src="/phone.png"
            alt="Phone icon"
            title="Make a phone call"
            role="button"
            aria-label="Click to connect on a phone call"
            tabIndex={0}
          />

          <img
            src="/video.png"
            alt="Video call icon"
            title="Make a video call"
            role="button"
            aria-label="Click to connect on a video call"
            tabIndex={0}
          />

          <img
            src="/info.png"
            alt="Info icon"
            title="Learn more"
            role="button"
            aria-label="Click to learn more"
            tabIndex={0}
          />
        </div>
      </div>

      <div className="middle-segment">
        {chatThread?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUserInfo.id
                ? "message own"
                : "message"
            }
            key={message?.createdAt}
          >
            <div className="contents">
              {message.photo && <img src={message.photo} alt="" />}

              <p>{message?.text}</p>

              <span>{formatElapsedTime(message?.createdAt.toMillis())}</span>
            </div>
          </div>
        ))}

        {photo.url && (
          <div className="message own">
            <div className="contents">
              <img src={photo.url} alt="" />
            </div>
          </div>
        )}

        <div ref={scrollIntoViewElemRef}></div>
      </div>

      <form
        className="bottom-segment"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="icons">
          <label htmlFor="share-photo">
            {/* Gallery icon */}
            <img
              src="/img.png"
              alt="Gallery icon"
              title="Open gallery"
              role="button"
              aria-label="Click to choose a picture from your device's internal storage"
              tabIndex={0}
            />
          </label>

          <input
            type="file"
            id="share-photo"
            onChange={sharePhoto}
            style={{ display: "none" }}
          />

          {/* Camera icon */}
          <img
            src="/camera.png"
            alt="Camera icon"
            title="Use camera"
            role="button"
            aria-label="Click to use your device's camera"
            tabIndex={0}
          />

          {/* Mic icon */}
          <img
            src="/mic.png"
            alt="Microphone icon"
            title="Use microphone"
            role="button"
            aria-label="Click to record audio using your device's mic"
            tabIndex={0}
          />
        </div>

        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isFriendBlocked
              ? "You can't message this Breezer"
              : "Type your message here..."
          }
          aria-label={
            isCurrentUserBlocked || isFriendBlocked
              ? "You can't message this Breezer"
              : "Type your message here"
          }
          onChange={(event) => setInputStr(event.target.value)}
          value={inputStr}
          disabled={isCurrentUserBlocked || isFriendBlocked}
        />

        <div className="emojis">
          <img
            src="/emoji.png"
            alt="Emojis' icon"
            title="Show emojis"
            onClick={() => setShouldOpen((prevVal) => !prevVal)}
            role="button"
            aria-label="Click to choose an emoji from the emoji picker"
            tabIndex={0}
          />

          <div className="emoji-picker">
            <EmojiPicker
              open={shouldOpen}
              onEmojiClick={(event) => handleEmojiSelection(event)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="send-btn"
          onClick={sendMessage}
          disabled={isCurrentUserBlocked || isFriendBlocked}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatThread;
