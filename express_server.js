const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const PORT = 8080; // default port
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

// setting to ejs
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2":  {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};


// create users object to store and access users in the app
const users = {};


// generate random strings for a user ID
const generateRandomString = () => {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    // random number between 0 and number of alphanumeric chars
    let randomNum = Math.floor(Math.random() * characters.length);
    randomStr += characters[randomNum];

  }
  return randomStr;
};

// helper function to find email in users obj
const findEmail = (email) => {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
  return false;
};


// function which returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id) => {
  let userURL = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURL[url] = urlDatabase[url];
    }
  }
  return userURL;
};

// helper function to authenticate user trying to log in
const authenticateUser = (email, password, database) => {
  const user = findEmail(email, database);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};


// render mainpage and form to shorten new URLs
app.get("/urls", (req, res) => {
  // if (!req.cookies["user_id"]) {
  //  return res.status(403).send("Please log in to view shortened URLs");
  // }
  const templateVars = { urls: urlsForUser(urlDatabase), user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

// route for creating new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };

  // if not a user -> cannot create shortened urls, redirect to login page
  if (!templateVars.user) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);

  
});

// render for shortened URL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {
  const userURL = urlsForUser(urlDatabase);
  const { shortURL } = req.params;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
 
  if (Object.keys(userURL).includes(shortURL)) {
    res.render("urls_show", templateVars);
    
  } else {
    res.status(400).send('You do not have permissions to edit URLs.');
  }
});


// form submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // creating random short url and add to URL database then redirect
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});



app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    if (!longURL) {
    } else {
      res.redirect(longURL);
    }
  }
});

// delete button entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;

  const userURL = urlsForUser(urlDatabase);
  if (Object.keys(userURL).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send('You do not have permissions to delete urls');
  }
});

// edit button entry
app.post('/urls/:shortURL', (req, res) => {
  const { longURL } = req.bodyc;
  const shortURL = req.params.shortURL;

  const userURL = urlsForUser(urlDatabase);
  if (Object.keys[userURL].includes(shortURL)) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.status(400).send("You do not have permissions to edit URLs");
  }
});

// update resource and redirect to mainpage
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});


// creating registration route
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("_registration", templateVars);

});

// resgistration handler that takes registration form data
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  

  // if no email/password are entered, send 400 error
  if (!email || !password) {
    return res.status(400).send('Email and Password cannot be blank');
  }

  

  // if email is already registered
  if (findEmail(email)) {
    return res.status(400).send('Email is already registered');
  }

  // new user object using generateRandomString function
  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: email,
    password: bcrypt.hashSync(password, salt),
  };
  // user_id cookie for newly generated userID
  res.cookie("user_id", userID);
  res.redirect('/urls');
});


// login route for login form template
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});



// login route
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
 
  // no email or password, send 400 error
  if (!email || !password) {
    return res.status(400).send("Enter email and password");
  }

  // check if user credentials are valid
  const user = authenticateUser(email, password, users);
  if (user) {
    req.cookie["user_id"] = user;
    return res.redirect('/urls');

  }


  
  
  if (!findEmail(email)) {
    return res.status(403).send("Email cannot be found");
  }
  
  // check to see if email is found, compare passwords with existing user's password
  let userID = findEmail(email);
  if (password !== users[userID].password) {
    return res.status(403).send("Password is incorrect");
  }

  // set user_id cookie to user's random ID and redirect to /urls
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});






// set port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

