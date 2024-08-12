import { create } from "zustand";
import { useUserStore } from "./userStore";

// Zustand store
export const useChatStore = create((set) => ({
  chatId: null,
  friendInfo: null,
  isCurrentUserBlocked: false,
  isFriendBlocked: false,

  // A custom action
  establishConnection: (chatId, friendInfo) => {
    const currentUserInfo = useUserStore.getState().currentUserInfo;

    if (friendInfo.blockedUsers.includes(currentUserInfo.id)) {
      // If the current user is blocked by their friend:
      return set({
        chatId,
        friendInfo: null, // The current user can't view their friend's profile
        isCurrentUserBlocked: true,
        isFriendBlocked: false,
      });
    } else if (currentUserInfo.blockedUsers.includes(friendInfo.id)) {
      // If the friend is blocked by the current user:
      return set({
        chatId,
        friendInfo: friendInfo, // The friend can obviously view their own profile
        isCurrentUserBlocked: false,
        isFriendBlocked: true,
      });
    } else {
      // Otherwise:
      return set({
        chatId,
        friendInfo,
        isCurrentUserBlocked: false,
        isFriendBlocked: false,
      });
    }
  },

  // Another custom action
  toggleBlockedStatus: () => {
    set((prevStates) => ({
      ...prevStates,
      isFriendBlocked: !prevStates.isFriendBlocked,
    }));
  },
}));
