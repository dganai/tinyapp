const { assert } = require('chai');

const { getUserByEmail, findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here

    assert(user, expectedUserID)
  });
});