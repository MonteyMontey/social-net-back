const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Load models
require('../models/User');
const User = mongoose.model('users');

// Activate 
router.get('/', (req, res) => {
  const activationCode = req.query.activationCode;

  User.findOneAndUpdate({ activationCode: activationCode, active: false }, { active: true }, { useFindAndModify: false }, (err, user) => {
    if (err === null && user !== null) {
      res.status(200).send();
    } else {
      res.status(400).send();
    }
  })
});

module.exports = router;
