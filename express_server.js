const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  let string = '';
  const cipher = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let i = 0;
  while (i < 6) {
    string += cipher.charAt(Math.floor(Math.random() * cipher.length));
    i++;
  }
  return string;
};

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; 
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

 app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies,
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Not working yet
app.get("/register", (req, res) => {
//  const templateVars = { username: req.cookies["username"] }; 
  res.render("user_registration"/*, templateVars*/);
});

app.post("/register", (req, res) => {
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", userId);
  console.log(users);
  res.redirect(`/urls`);
});

//Login & Logout Feature (Cookies)

app.post("/login", (req, res) => {
  console.log(req.body.username);
  const username = req.body.username;

  res.cookie('name', username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  const username = req.body.username;

  res.clearCookie('name', username)
  res.redirect('/urls');
});

//Will log once the server starts

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});