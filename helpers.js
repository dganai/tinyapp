const bcrypt = require('bcryptjs');



// helper function to find user by email
const findUserByEmail = (email, database) => {
  for (const userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

// helper function to authenticate user trying to log in
const authenticateUser = (email, password, database) => {
  const user = findUserByEmail(email, database);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

// function which returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id, urlDatabase) => {
  const userURL = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURL[url] = urlDatabase[url];
    }
  }
  return userURL;
};

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



module.exports = {
  findUserByEmail,
  authenticateUser,
  urlsForUser,
  generateRandomString
};