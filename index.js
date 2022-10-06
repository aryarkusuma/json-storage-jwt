require('dotenv').config();
const fetch = require('node-fetch');
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

async function getJson(req, res, next) { //Retrive Saved Json
  try{
    const id = req.query.id;
    const response = await fetch('https://json.projectxi.my.id/api/get-json?id=' + id);
    const data = await response.json();
    console.log(data);
    return res.json(data);
  } catch {
    return res.sendStatus(403);
  }
}

async function delJson(req, res, next) { //Retrive Saved Json
  try{
    const id = req.query.id;
    const response = await fetch('https://json.projectxi.my.id/api/del-json?id=' + id);
    const data = await response.json();
    console.log(data);
    return res.json(data);
  } catch {
    return res.sendStatus(403);
  }
}

async function saveJson(req, res, next) { //Retrive Saved Json
  try{
    const response = await fetch("https://633eb34d640af72e3ebcce56--json-saver.netlify.app/api/save-json", 
    {
      method: 'POST',
      headers: {
        "Content-type": 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    const data = await response.json();
    console.log(data);
    res.json((data));
  } catch {
    return res.sendStatus(403);
  }
}


const authorization = (req, res, next) => {
  const token = req.cookies.at;
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
  return res.json({ message: "Welcome To JSON File Storage" });
});

const usercheck = (req, res, next) => {
    //check username and password user
      if(typeof(req.query.username) == 'undefined' || typeof(req.query.password) == 'undefined'){ // kita bisa menambahkan logika pemeriksaan nantinya dengan membuat / menggunakan suatu library 
        return res.json({ message: "Login Failed" });
      } else{
        req.username = String(req.query.username);
        req.password = String(req.query.username);
        return next() 
      }
}

app.post("/login", usercheck, (req, res) => {
  const token = jwt.sign({ username: req.username }, process.env.YOUR_SECRET_KEY);
  return res
    .cookie("at", token, {
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
    .clearCookie("at")
    .status(200)
    .json({ message: "Anda telah logout!" });
});

app.get("/service/get-json", authorization, getJson, (req,res) => {});
app.get("/service/del-json", authorization, delJson, (req,res) => {});
app.post("/service/save-json", authorization, saveJson, (req,res) => {});

app.post("/service/test", (req,res) => {return res.json({ data: req.body });});

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

start( process.env.PORT || 3000);

