const express = require("express");
const app = express();
const PORT = 8080; // default port
const cookieParser = require('cookie-parser');


// setting to ejs
app.set("view engine", "ejs");

app.use(cookieParser());



const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
// generate random strings for a user ID
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    // random number between 0 and number of alphanumeric chars
    let randomNum = Math.floor(Math.random() * characters.length);
    randomStr += characters[randomNum];

  }
  return randomStr;
}


// render mainpage and form to shorten new URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// route for creating new shortURL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");

  
});

// render for shortened URL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


// form submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // creating random short url and add to URL database then redirect
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// delete button entry
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// edit button entry
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

// update resource and redirect to mainpage
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});



// login route
app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



// set port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

