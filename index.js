require('dotenv').config();
const fetch = require('node-fetch');
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cookieParser());

async function getJson(req, res, next) { //Retrive Saved Json
  try{
    const id = req.query.id;
    const response = await fetch('https://json.projectxi.my.id/api/get-json?id=' + id);
    const data = await response.json();
    console.log(data);
    res.json(data);
  } catch {
    return res.sendStatus(403);
  }
}


const authorization = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, process.env.YOUR_SECRET_KEY);
    req.username = data;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};

app.get("/", (req, res) => {
  return res.json({ message: "Welcome To TXT File Storage" });
});

const usercheck = (req, res, next) => {
    //check username and password user
      if(typeof(req.query.username) == 'undefined'){
        return res.json({ message: "Unauthorized" });
      } else{
        req.username = req.query.username
        return next() 
      }
}

app.get("/login", usercheck, (req, res) => {
  const token = jwt.sign({ username: req.username }, process.env.YOUR_SECRET_KEY);
  return res
    .cookie("access_token", token, {
      httpOnly: true,
      secure: true,
    })
    .status(200)
    .json({ message: "Login berhasil" });
});

app.get("/auth/profile", authorization, (req, res) => {
  console.log(req.username)
  return res.json({ user: req.username });
});

app.get("/logout", authorization, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out 😏 🍀" });
});

app.get("/get-json", authorization, getJson, (req,res) => {});


const start = (port) => {
  try {
    app.listen(port, () => {
      console.log(`Api up and running at: http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

start(8888);

