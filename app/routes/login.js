const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const logger = require('../helpers/logger');

dotenv.config();

// Load models
require('../models/User');
const User = mongoose.model('users');


// Check if login valid
router.post('/', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user && err === null) {
      if (user.active) {
        user.comparePassword(password, (err, isMatch) => {
          if (isMatch && err === null) {
            const id = user._id;
            const payload = { id };
            const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' });
            res.cookie('token', token).sendStatus(200);
            logger.info('User logged in', {
              user: user,
              date: new Date()
            });
          } else {
            logger.warn('Invalid password', {
              email: email,
              date: new Date()
            });
            res.status(401).send();
          };
        }
        );
      } else {
        logger.info('Non active user tried to log in', {
          user: user,
          date: new Date()
        });
        res.status(403).send(); // 403 = Forbidden
      }
    } else {
      logger.warn('User login not found', {
        email: email,
        date: new Date()
      });
      res.status(404).send();
    }
  })
});

module.exports = router;
