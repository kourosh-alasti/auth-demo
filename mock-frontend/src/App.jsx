import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./Login";
import DiscordLogin from "./DiscordLogin";
import Cookies from "js-cookie";

function App() {
  const [user, setUser] = useState({});
  const [token, setToken] = useState(null);

  useEffect(() => {
    const user = Cookies.get("token");
    console.log(user);

    if (user) {
      setToken(user);
    } else {
      setToken(null);
    }
  }, []);

  const handleLogin = (token) => {
    setToken(token);
  };

  const fetchDiscord = async () => {
    try {
      const res = await axios.get("http://localhost:5100/discord/user", {
        withCredentials: true,
      });

      setUser(res);
    } catch (error) {
      console.error("Error getting discord: ", error);
    }
  };

  const fetchProtectedData = async () => {
    try {
      const response = await axios.get("http://localhost:5100/api/protected", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Protected Data: ", response.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center mt-24">
      {token ? (
        <>
          <h1> Welcome! </h1>
          <button onClick={fetchProtectedData}> Get Protected Data </button>

          <button onClick={fetchDiscord}>Fetch Discord Data</button>

          <p>{JSON.stringify(user)}</p>
        </>
      ) : (
        <>
          <Login onLogin={handleLogin} />
          <DiscordLogin />
        </>
      )}
    </div>
  );
}

export default App;
