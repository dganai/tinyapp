const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const PORT = 8080; // default port
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

// setting to ejs
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({ extended: true }));


const {
  findUserByEmail,
  authenticateUser,
  urlsForUser,
  generateRandomString,
} = require('./helpers');


const urlDatabase = {
  "b2xVn2": {
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


app.get('/', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


// render mainpage and form to shorten new URLs
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { urls: urlsForUser(userID, urlDatabase), user: users[userID] };
  res.render("urls_index", templateVars);
});

// route for creating new shortURL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };

  // if not a user -> cannot create shortened urls, redirect to login page
  if (!userID) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// render for shortened URL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;

  const userURL = urlsForUser(userID, urlDatabase);
  const { shortURL } = req.params;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[userID] };
 
  if (Object.keys(userURL).includes(shortURL)) {
    res.render("urls_show", templateVars);
    
  } else {
    res.status(400).send('You do not have permissions to edit URLs.');
  }
});


// form submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  
  if (userID) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID,
    };
    res.redirect(`/urls/${shortURL}`);

  } else {
    res.status(400).send("Please log in to create a short URL");
  }

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
  const userID = req.session.user_id;

  const { shortURL } = req.params;

  const userURL = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURL).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send('You do not have permissions to delete urls');
  }
});

// edit button entry
app.post('/urls/:shortURL', (req, res) => {
  const { longURL } = req.body;
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;

  const userURL = urlsForUser(userID, urlDatabase);
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
  const userID = req.session.user_id;
  const templateVars = { user: users[userID]};
  res.render("_registration", templateVars);

});

// resgistration handler that takes registration form data
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();
  const userFound = findUserByEmail(email, users);
  

  // if no email/password are entered, send 400 error
  if (!email || !password) {
    return res.status(400).send('Email and Password cannot be blank');
  }


  // if email is already registered
  if (userFound) {
    return res.status(400).send('Email is already registered');
  }

  // new user object using generateRandomString function
  users[userID] = {
    id: userID,
    email: email,
    password: bcrypt.hashSync(password, salt),
  };
  // user_id cookie for newly generated userID
  req.session.user_id = userID;
  res.redirect('/urls');
});


// login route for login form template
app.get('/login', (req, res) => {
  const userID = req.session.user_id;

  const templateVars = { user: users[userID] };
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
    req.session.user_id = user.id;
    return res.redirect('/urls');

  }

  
  if (!findUserByEmail(email)) {
    return res.status(403).send("Email cannot be found");
  }
  
  // check to see if email is found, compare passwords with existing user's password
  let userID = findUserByEmail(email);
  if (password !== users[userID].password) {
    return res.status(403).send("Password is incorrect");
  }

  // set user_id cookie to user's random ID and redirect to /urls
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});






// set port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

