import "./login.css";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, firestoreDB } from "../../lib/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import getImageURL from "../../lib/storage-monitor-upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarSelection = (event) => {
    if (event.target.files[0]) {
      setAvatar({
        file: event.target.files[0],
        url: URL.createObjectURL(event.target.files[0]),
      });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    const formData = new FormData(event.target);

    const { registeredEmail, registeredPassword } =
      Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(
        auth,
        registeredEmail,
        registeredPassword
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    const formData = new FormData(event.target);

    const { username, email, password } = Object.fromEntries(formData);

    if (username.trim() === "") return;

    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const imgURL = await getImageURL(avatar.file);

      // Add a new user to the firestore database
      await setDoc(doc(firestoreDB, "users", response.user.uid), {
        id: response.user.uid,
        username: username.trim(),
        email,
        avatar: imgURL,
        blockedUsers: [],
      });

      // Fetch the associated chats for the user
      await setDoc(doc(firestoreDB, "userChats", response.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now.");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <section className="item">
        <h2>Welcome back</h2>

        {/* Login form */}
        <form onSubmit={handleLogin}>
          <label htmlFor="registered-email" className="sr-only">
            Enter your email
          </label>

          <input
            type="email"
            name="registeredEmail"
            id="registered-email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="registered-password" className="sr-only">
            Enter your password
          </label>

          <input
            type="password"
            name="registeredPassword"
            id="registered-password"
            placeholder="Enter your password"
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Sign in"}
          </button>
        </form>
      </section>

      <div className="separator-line"></div>

      <section className="item">
        <h2>Create an account</h2>

        {/* Registration form */}
        <form onSubmit={handleRegistration}>
          <label
            htmlFor="file"
            className="label"
            role="button"
            aria-label="Click to upload an image"
            tabIndex={0}
          >
            <img
              src={avatar.url || "/avatar.png"}
              alt="User avatar"
              title="Upload an avatar"
            />
            Upload an image
          </label>

          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatarSelection}
          />

          <label htmlFor="username" className="sr-only">
            Enter your username
          </label>

          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter your username"
            required
          />

          <label htmlFor="email" className="sr-only">
            Enter your email
          </label>

          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password" className="sr-only">
            Enter your password
          </label>

          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Sign up"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Login;
