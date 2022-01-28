const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

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
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here

    assert(user, expectedUserID);
  });

  it('should return undefined if the email is not registered in database', () => {
    const user = findUserByEmail('jsjhshdh@test.com', testUsers);

    assert.equal(user, undefined);
  });

  it('should return undefined if email is non-existent', () => {
    const user = findUserByEmail('', testUsers);
    
    assert.equal(user, undefined);
  })
});