const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const nodemailer = require('../helpers/nodemailer');

const mailer = new nodemailer();

dotenv.config();


// Load models
require('../models/User');
const User = mongoose.model('users');

require('../models/PasswordReset');
const PasswordReset = mongoose.model('passwordResets');


router.post('/', (req, res) => {
  const email = req.body.email;

  // check if email in database
  User.findOne({ email: email })
    .then(user => {
      if (user !== null) {

        // create reset ID
        const resetID = crypto.randomBytes(40).toString('hex');

        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(resetID, salt, (err, hash) => {
            if (err) throw err;

            // store reset to database
            const resetData = {
              user: user,
              resetIDHash: hash
            }

            new PasswordReset(resetData)
              .save()
              .then(() => {

                // send email with unhashed id
                try {
                  mailer.sendPasswordReset(email, resetID);
                } catch (e) {
                  logger.error('Password reset email could not be sent', {
                    error: err,
                    date: new Date
                  });
                  // TODO: mark that email as not sent and queue it in a task that resents it when possible
                }
                
              })
              .catch(() => {
                res.status(500).send();
              });
          });
        });
      }
      res.status(200).send();
    })
    .catch(_ => {
      res.status(500).send();
    });

});

module.exports = router;
