const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const withAuth = require('../helpers/withAuth');

const userValidator = require('../helpers/userValidator');

dotenv.config();

// Load models
require('../models/User');
const User = mongoose.model('users');

// Read user
router.get('/', withAuth, (req, res) => {
  User
    .findOne({ _id: req.query.id })
    .then(user => {
      res.send(user);
    })
    .catch(err => {
      console.error("Failed to fetch user from MongoDB", err);
      res.status(500).send();
    })
});


// Create user
router.post('/', (req, res) => {
  let userData = req.body;
  let validator = new userValidator();

  if (validator.isUserDataValid(userData)) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(userData.password, salt, (err, hash) => {
        if (err) throw err;
        userData.password = hash;

        new User(userData)
          .save()
          .then(userData => {
            console.log("Successfully saved registration data to MongoDB\n", userData);
            const id = userData._id;
            const payload = { id };
            const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true }).sendStatus(200);
          })
          .catch(err => {
            console.error("Failed to save registration data to MongoDB", err);
            res.status(500).send();
          })
      });
    });
  } else {
    console.error("Invalid registration data")
    res.status(400).send();
  }
});

module.exports = router;
