import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5100/api/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );
      const { token } = response.data;

      document.cookie = `token=${token};HttpOnly;Secure;expires=1h;path=/;domain=${window.location.hostname}`;

      onLogin(token);
    } catch (error) {
      console.error("Login Failed: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-6">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="Submit">Login</button>
    </form>
  );
}

export default Login;
