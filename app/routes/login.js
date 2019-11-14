const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Load models
require('../models/User');
const User = mongoose.model('users');


// Check if login valid
router.post('/', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (err) throw err;
    user.comparePassword(password, (err, isMatch) => {
      if (err) throw err;
      
      if (isMatch) {
        console.log("valid login", user);
        const id = user._id;
        const payload = { id };
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true }).sendStatus(200);
      } else {
        console.log("invalid login");
        res.status(401).send();
      }
    });
  });
});

module.exports = router;
