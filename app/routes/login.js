const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load models
require('../models/User');
const User = mongoose.model('users');

// Check if login valid
router.post('/', (req, res) => {

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) throw err;

    user.comparePassword(req.body.password, function (err, isMatch) {
      if (err) throw err;

      if (isMatch) {
        console.log("valid login");
        res.status(200).send();
      } else {
        console.log("invalid login");
        res.status(401).send();
      }
    });
  });
});

module.exports = router;
