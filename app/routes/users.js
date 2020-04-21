const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const withAuth = require('../helpers/withAuth');
const nodemailer = require('../helpers/nodemailer');


const userValidator = require('../helpers/userValidator');

const logger = require('../helpers/logger');

const mailer = new nodemailer();

dotenv.config();

// Load models
require('../models/User');
const User = mongoose.model('users');

// textsearch users
router.get('/textsearch', withAuth, (req, res) => {
  User.find({ $or: [{ firstName: { $regex: req.query.inputValue, $options: 'i' } }, { lastName: { $regex: req.query.inputValue, $options: 'i' } }] })
    .limit(10)
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      logger.error('Could not textsearch user', {
        error: err,
        date: new Date
      });
      res.status(500).send();
    })
});

// Read user
router.get('/', withAuth, (req, res) => {
  User
    .findOne({ _id: req.query.id })
    .then(user => {
      res.send(user);
    })
    .catch(err => {
      logger.error('Could not get user from MongoDB', {
        error: err,
        date: new Date
      });
      res.status(500).send();
    })
});


// Create user
router.post('/', (req, res) => {
  let userData = req.body;
  let validator = new userValidator();

  if (validator.isUserDataValid(userData)) {

    // check if email already in system
    User.findOne({ email: userData.email })
      .then(user => {
        if (user === null) {

          // hash password
          bcrypt.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(userData.password, salt, (err, hash) => {
              if (err) throw err;
              userData.password = hash;

              // create activation code
              userData.activationCode = crypto.randomBytes(40).toString('hex');

              // store user in database
              new User(userData)
                .save()
                .then(() => {

                  //send email
                  try {
                    mailer.sendEmailVerification(userData.email, userData.activationCode)
                  } catch (e) {
                    logger.error('Verification email could not be sent', {
                      error: err,
                      date: new Date
                    });
                    // TODO: mark that email as not sent and queue it in a task that resents it when possible
                  }

                  res.status(200).send();
                })
                .catch(err => {
                  logger.error('Could not save registration data to MongoDB', {
                    error: err,
                    date: new Date
                  });
                  res.status(500).send();
                })
            });
          });
        } else {
          res.status(400).send();
        }
      })
      .catch(() => {
        res.status(500).send();
      });

  } else {
    logger.warn('Invalid registration data', {
      registrationData: userData,
      date: new Date
    });
    res.status(400).send();
  }
});

module.exports = router;
