const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const nodemailer = require('../helpers/nodemailer');
const userValidator = require('../helpers/userValidator');
const logger = require('../helpers/logger');

const mailer = new nodemailer();

dotenv.config();


// Load models
require('../models/User');
const User = mongoose.model('users');

require('../models/PasswordReset');
const PasswordReset = mongoose.model('passwordResets');


// user submits new password
router.put('/', (req, res) => {
  const newPassword = req.body.newPassword;
  const resetIDHash = req.body.resetIDHash;

  const passwordValid = new userValidator().isPasswordValid(newPassword);

  if (!passwordValid) {
    logger.warn('Input Validation Failure - Password Reset)', {
      ip: req.ip,
      date: new Date
    });
    res.status(400).send();
  } else {

    // hash password
    let hashedNewPassword;

    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(newPassword, salt, (err, hash) => {
        if (err) throw err;
        hashedNewPassword = hash;
      });
    });

    // change password and delete password reset
    PasswordReset.findOne({ "createdAt": { $gte: new Date() - 36e5 }, "resetIDHash": resetIDHash })
      .then(passwordReset => {
        if (passwordReset !== null) {
          const passwordResetID = passwordReset._id;

          User.findByIdAndUpdate(passwordReset.user, { password: hashedNewPassword }, { useFindAndModify: false })
            .then(() => {
              PasswordReset.findByIdAndDelete(passwordResetID, { useFindAndModify: false })
                .then(() => {
                  res.status(200).send();
                })
                .catch(() => {
                  // TODO: either rollback password change and return status code 500 
                  // OR mark it somewhere somehow for another service so that it is removed as soon as possible
                  res.status(200).send();
                })
            })
            .catch((e) => {
              logger.error('Internal Database Query Failure - Find User For Password Reset', {
                error: e,
                date: new Date
              });
              res.status(500).send();
            });

        } else {
          // no password reset
          res.status(400).send();
        }
      })
      .catch((e) => {
        logger.error('Internal Database Query Failure - Password Reset', {
          error: e,
          date: new Date
        });
        res.status(400).send();
      });
  }
});


// user goes to reset link
router.get('/', (req, res) => {
  const resetID = req.query.resetID;

  PasswordReset.find({ "createdAt": { $gte: new Date() - 36e5 } })
    .then(passwordResets => {

      let valid = false;
      let callbackCounter = 0;
      let resetIDHash;

      for (let i = 0; i < passwordResets.length; i++) {
        callbackCounter++;

        bcrypt.compare(resetID, passwordResets[i].resetIDHash, (err, result) => {
          if (result) {
            valid = true;
            resetIDHash = passwordResets[i].resetIDHash;
          }
          callbackCounter--;
        });
      }

      // wait until all callbacks finished
      waitForCallbacks = () => {
        if (callbackCounter === 0) {
          valid ? res.status(200).send({ resetIDHash: resetIDHash }) : res.status(400).send();
        } else {
          setTimeout(waitForCallbacks, 100);
        }
      }
      waitForCallbacks();
    }
    );
});


// user requests email
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
                } catch (err) {
                  logger.error('Password reset email could not be sent', {
                    error: err,
                    date: new Date
                  });
                  // TODO: mark that email as not sent and queue it in a task that resents it when possible
                }

              })
              .catch((e) => {
                logger.error('Internal Database Query Failure - Password Reset Could Not Be Saved', {
                  error: e,
                  date: new Date
                });
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
