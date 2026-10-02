const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
      return user.username === username && user.password === password;
    });
    return validusers.length > 0;
  };
  
  // Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
    }
  
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken, username
      };
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization['username'];
  
    if (!review) {
      return res.status(400).json({ message: "Review query parameter is required" });
    }
  
    if (books[isbn]) {
      // Add or update the review under the user's username key
      books[isbn].reviews[username] = review;
      return res.status(200).json({ 
        message: `The review for the book with ISBN ${isbn} has been added/updated.` 
      });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];
  
    if (books[isbn]) {
      if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ 
          message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.` 
        });
      } else {
        return res.status(404).json({ message: "No review found for this user on this book" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
