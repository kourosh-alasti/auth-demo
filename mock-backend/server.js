require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_SECRET;

const mock_users = [
  { username: "kourosh", password: "perfectpassword" },
  { username: "admin", password: "password" },
];

function generateJWT(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
}

function verifiyJWTMiddleware(req, res, next) {
  const token = req.cookies.token;
  const discord_token = req.cookies.discord_token;

  if (!token) {
    return res
      .status(403)
      .send({ message: "Access Denied, no token provided" });
  }

  if (discord_token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Failed to authenticate" });
    }

    req.user = decoded;
    next();
  });
}

app.use(
  cors({
    origin: ["*", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = mock_users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = generateJWT(username);

    res
      .cookie("token", token, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        path: "/",
        domain: "localhost",
      })
      .send({ message: "Logged In", token });
  } else {
    res.status(401).send({ message: "Invalid credentials" });
  }
});

app.get("/api/protected", verifiyJWTMiddleware, (req, res) => {
  res.send({ data: "This is protected data", user: req.user });
});

app.get("/discord/login", (req, res) => {
  console.log("Discord Login");

  const uri = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5100%2Fdiscord%2Fcallback&scope=identify+email`;

  res.redirect(uri);
});

app.get("/discord/callback", async (req, res) => {
  const { code } = req.query;

  const tokenResponse = await axios.post(
    "https://discord.com/api/oauth2/token",
    new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:5100/discord/callback",
      code: code,
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token } = tokenResponse.data;

  res
    .cookie("discord_token", access_token, { httpOnly: false, secure: true })
    .cookie("token", generateJWT(access_token), {
      httpOnly: false,
      secure: true,
    })
    .redirect("http://localhost:5173");
});

app.get("/discord/user", async (req, res) => {
  const { discord_token } = req.cookies;

  const userResponse = await axios.get("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${discord_token}`,
    },
  });

  res.send({
    user: userResponse.data,
  });
});

app.listen(5100, () =>
  console.log("Server Running on Port 5100 at http://localhost:5100")
);
