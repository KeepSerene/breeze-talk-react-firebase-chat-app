import "./chat-preview.css";

// Component imports
import UserInfo from "./user-info/UserInfo";
import Chats from "./chats/Chats";

const ChatPreview = () => {
  return (
    <div className="chat-preview">
      <UserInfo />

      <Chats />
    </div>
  );
};

export default ChatPreview;
