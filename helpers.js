const getUserByEmail = (email, users) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return;
};

module.exports = { getUserByEmail };