import "./App.css";

// Component imports
import ChatThread from "./components/chat-thread/ChatThread";
import ChatDetails from "./components/chat-details/ChatDetails";
import ChatPreview from "./components/chat-preview/ChatPreview";
import Login from "./components/login/Login";
import ToastNotif from "./components/toast-notif/ToastNotif";

// Other imports
import { useUserStore } from "./lib/userStore";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase-config";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUserInfo, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) =>
      fetchUserInfo(user?.uid)
    );

    return () => unsubscribe();
  }, [fetchUserInfo]);

  if (isLoading) {
    return (
      <div
        className="loader-wrapper"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <div className="loader">
          <span className="sr-only">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentUserInfo ? (
        <>
          <ChatPreview />

          {chatId && <ChatThread />}

          {chatId && <ChatDetails />}
        </>
      ) : (
        <Login />
      )}

      <ToastNotif />
    </div>
  );
};

export default App;
