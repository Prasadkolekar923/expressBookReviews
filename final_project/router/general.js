const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

isValid = (username) => {
  // Check if username exists in users array
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user. Username or password not provided." });
});

// Task 10: Get the book list available in the shop using Promises
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });

  getBooks
    .then((bookList) => {
      return res.status(200).send(JSON.stringify(bookList, null, 4));
    })
    .catch((err) => {
      return res.status(500).json({ message: "Error fetching book list" });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author using Promises
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      let matchingBooks = [];
  
      bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          matchingBooks.push(books[key]);
        }
      });
  
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found for this author");
      }
    });
  
    getBooksByAuthor
      .then((matchingBooks) => {
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
      })
      .catch((err) => {
        return res.status(404).json({ message: err });
      });
  });

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);
  let matchingBooks = [];

  bookKeys.forEach((key) => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks.push(books[key]);
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
