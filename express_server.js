const express = require("express");
const app = express();
const PORT = 8080; // default port


app.set("view engine", "ejs");

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


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


// form submission
app.post("/urls", (req, res) => {
let shortURL = generateRandomString(); // creating random short url and add to URL database then redirect
urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);
})


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

