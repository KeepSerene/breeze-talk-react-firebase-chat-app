import "./chat-details.css";

import { auth, firestoreDB } from "../../lib/firebase-config";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const ChatDetails = () => {
  const { currentUserInfo } = useUserStore();
  const {
    chatId,
    friendInfo,
    isCurrentUserBlocked,
    isFriendBlocked,
    toggleBlockedStatus,
  } = useChatStore();

  const blockFriend = async () => {
    // If already blocked:
    if (!friendInfo) return;

    const currentUserDocRef = doc(firestoreDB, "users", currentUserInfo.id);

    try {
      await updateDoc(currentUserDocRef, {
        blockedUsers: isFriendBlocked
          ? arrayRemove(friendInfo.id)
          : arrayUnion(friendInfo.id),
      });

      toggleBlockedStatus();

      if (isCurrentUserBlocked) {
        toast.warn("You were blocked by this Breezer!");
      } else if (isFriendBlocked) {
        toast.success("You unblocked this Breezer!");
      } else {
        toast.warn("You blocked this Breezer!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <article className="chat-details">
      <section className="user">
        <img src={friendInfo?.avatar || "/avatar.png"} alt="User avatar" />

        <h2>{friendInfo?.username || "Breezer"}</h2>

        <p>Lorem ipsum dolor sit amet.</p>
      </section>

      <div className="options">
        <div className="option">
          <div className="header">
            <span>Chat settings</span>

            <img src="/arrowUp.png" alt="Up-arrow icon" className="icon" />
          </div>
        </div>

        <div className="option">
          <div className="header">
            <span>Privacy & help</span>

            <img src="/arrowUp.png" alt="Up-arrow icon" className="icon" />
          </div>
        </div>

        <div className="option">
          <div className="header">
            <span>Shared photos</span>

            <img src="/arrowDown.png" alt="Down-arrow icon" className="icon" />
          </div>

          <div className="photos">
            <div className="photo-item">
              <div className="photo-desc">
                <img src="https://picsum.photos/200" alt="" />

                <span>Photo title</span>
              </div>

              <img
                src="/download.png"
                alt="Download icon"
                className="icon"
                title="Download photo"
                role="button"
                aria-label="Click to download the image"
                tabIndex={0}
              />
            </div>

            <div className="photo-item">
              <div className="photo-desc">
                <img src="https://picsum.photos/200" alt="" />

                <span>Photo title</span>
              </div>

              <img
                src="/download.png"
                alt="Download icon"
                className="icon"
                title="Download photo"
                role="button"
                aria-label="Click to download the image"
                tabIndex={0}
              />
            </div>

            <div className="photo-item">
              <div className="photo-desc">
                <img src="https://picsum.photos/200" alt="" />

                <span>Photo title</span>
              </div>

              <img
                src="/download.png"
                alt="Download icon"
                className="icon"
                title="Download photo"
                role="button"
                aria-label="Click to download the image"
                tabIndex={0}
              />
            </div>

            <div className="photo-item">
              <div className="photo-desc">
                <img src="https://picsum.photos/200" alt="" />

                <span>Photo title</span>
              </div>

              <img
                src="/download.png"
                alt="Download icon"
                className="icon"
                title="Download photo"
                role="button"
                aria-label="Click to download the image"
                tabIndex={0}
              />
            </div>
          </div>
        </div>

        <div className="option">
          <div className="header">
            <span>Shared files</span>

            <img src="/arrowUp.png" alt="Up-arrow icon" className="icon" />
          </div>
        </div>

        <button type="button" onClick={blockFriend}>
          {isCurrentUserBlocked
            ? "Blocked by Breezer"
            : isFriendBlocked
            ? "Unblock Breezer"
            : "Block Breezer"}
        </button>

        <button
          type="button"
          className="logout-btn"
          onClick={() => auth.signOut()}
        >
          Logout
        </button>
      </div>
    </article>
  );
};

export default ChatDetails;
