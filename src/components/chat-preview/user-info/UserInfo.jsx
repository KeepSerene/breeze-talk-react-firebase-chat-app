import "./user-info.css";

import { useUserStore } from "../../../lib/userStore";

const UserInfo = () => {
  const { currentUserInfo } = useUserStore();

  return (
    <article className="user-info">
      <section className="user">
        <img src={currentUserInfo.avatar || "/avatar.png"} alt="User avatar" />

        <h2 title={currentUserInfo.username}>
          {currentUserInfo.username.length > 8
            ? `${currentUserInfo.username.slice(0, 7)}...`
            : currentUserInfo.username}
        </h2>
      </section>

      <div className="icons">
        <img
          src="/more.png"
          alt="More options icon"
          title="More options"
          role="button"
          aria-label="Click to view more available features"
          tabIndex={0}
        />

        <img
          src="/video.png"
          alt="Video call icon"
          title="Host a video metting"
          role="button"
          aria-label="Click to host a video meeting with other BreezeTalkers"
          tabIndex={0}
        />

        <img
          src="/edit.png"
          alt="Edit profile icon"
          title="Edit your profile"
          role="button"
          aria-label="Click to edit your profile"
          tabIndex={0}
        />
      </div>
    </article>
  );
};

export default UserInfo;
