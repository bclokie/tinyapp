//   APP REQUIREMENTS   // 
const express = require("express");
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

//   APPS   //
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

//   DATA & OBJECTS   // 
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// FUNCTIONS //

const generateRandomString = () => {
  let string = "";
  const cipher = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let i = 0;
  while (i < 6) {
    string += cipher.charAt(Math.floor(Math.random() * cipher.length));
    i++;
  }
};

const urlsForUser = (userID) => {
  const filteredURLS = {};
  for (let shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      filteredURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredURLS;
};

//  URL ROUTES  // 

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { urls: urlsForUser(userId), user };
  if (!user) { return res.status(400).send("Please login or register to view your short URLs."); }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const shortURL = req.params.id;
  if (!urlDatabase.hasOwnProperty(shortURL)) { return res.status(400).send("This URL does not exist."); }
  if (!req.cookies["user_id"]) { return res.status(400).send("Please login to view this short URL.");  }
  if (!urlsForUser(userId).hasOwnProperty(shortURL)) { return res.status(400).send("You are not authorized to view this link.") }
  const longURL = urlDatabase[shortURL].longURL
  const templateVars = { id: shortURL, longURL: longURL, userID: userId, user: user };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) { return res.status(400).send("Short URL does not exist"); }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (!user) { return res.status(400).send("Please login or register to create short URLs!") }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: userId };
//  console.log("User creating url:\n", userId);
//  console.log("Object added:\n", urlDatabase[shortURL]);
//  console.log("urlDatabase object:\n", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase.hasOwnProperty(shortURL)) { return res.status(400).send("This URL does not exist."); }
  if (!req.cookies["user_id"]) { return res.status(400).send("Please login to view this short URL."); }
  if (!urlsForUser(userId).hasOwnProperty(shortURL)) { return res.status(400).send("You are not authorized to view this link.") }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  const userId = req.cookies["user_id"]
  if (!urlDatabase.hasOwnProperty(shortURL)) { return res.status(400).send("This URL does not exist."); }
  if (!req.cookies["user_id"]) { return res.status(400).send("Please login to view this short URL.");  }
  if (!urlsForUser(userId).hasOwnProperty(shortURL)) { return res.status(400).send("You are not authorized to view this link.") }
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

//  USER REGISTRATION   // 

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (user) { return res.redirect(`/urls`); }
  console.log(req.cookies["user_id"]);
  res.render("user_registration", { user });
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  // If no email or password return error 400 
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("One or more fields left empty.");
  }
  // If already registered return error 400
  for (const user in users) {
    if (users[user].email === email) {
      return res.status(400).send("Account exists. Please login or register with a new email.");
    }
  };
  const userId = generateRandomString();
  const user = { id: userId, email: req.body.email, password: req.body.password };
  users[userId] = user;
  res.cookie("user_id", userId);
 // console.log("Users Object:\n", users);
 // console.log("User Email:\n", user.email);
  res.redirect(`/urls`);

});

//  LOGIN   // 
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (user) { return res.redirect(`/urls`); }
  res.render("user_login", { user });
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  for (const user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        res.cookie("user_id", users[user].id);
        return res.redirect(`/urls`);
      } 
      return res.status(403).send("Incorrect Password")
    }
  };
  return res.status(403).send("403 - Account Does Not Exist")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_id);
  res.redirect(`/login`);
});

//  PORT LOG  //  
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/* DUCK?

           _   
       .__(.)< (MEOW)
        \___)
 ~~~~~~~~~~~~~~~~~~-->

 */