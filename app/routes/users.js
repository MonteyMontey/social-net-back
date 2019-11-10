const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userValidator = require('../helpers/userValidator');


// Load models
require('../models/User');
const User = mongoose.model('users');

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
            res.status(200).send();
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
