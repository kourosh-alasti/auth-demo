function DiscordLogin() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5100/discord/login";
  };

  return <button onClick={handleLogin}>Google Login</button>;
}

export default DiscordLogin;
