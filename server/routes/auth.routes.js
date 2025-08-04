const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const router = express.Router();

const User = require("../models/User.model");

const saltRounds = 10;

// POST /auth/signup
router.post("/signup", (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // check if email exists on db
  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = {
        email: email,
        password: hashedPassword,
        name: name,
      };

      return User.create(newUser);
    })
    .then((createdUser) => {
      // deconstruct to not show password
      const { email, name, _id } = createdUser;

      const user = { email, name, _id };

      res.status(201).json({ user: user });
    })
    .catch((error) => {
      console.log("Error trying to create an account.");
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// POST /auth/login
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Provide email and password" });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, name } = foundUser;

        const payload = {
          _id: _id,
          email: email,
          name: name,
        };

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.json({ authToken: authToken });
        console.log("Logged in!");
      }
    })
    .catch((error) => {
      console.log("Error trying to log in.");
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

module.exports = router;
