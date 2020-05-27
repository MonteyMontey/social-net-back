const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const withAuth = require('../helpers/withAuth');

const logger = require('../helpers/logger');

// Load models
require('../models/FriendRequestNotification');
require('../models/Alerts');
const FriendRequestNotification = mongoose.model('friendRequestNotifications');
const Alert = mongoose.model('alerts');

router.put('/alerts', withAuth, (req, res) => {
  ids = req.body.ids;
  update = req.body.update;

  Alert
    .updateMany({ _id: { "$in": ids } }, update)
    .then(_ => {
      res.status(200).send();
    })
    .catch(err => {
      console.log(err);
      logger.error('Internal Database Query Failure - Could Not Update Alerts', {
        ids: ids,
        error: err,
        date: new Date()
      })
      res.status(500).send();
    })
});


router.put('/friendRequests', withAuth, (req, res) => {
  ids = req.body.ids;
  update = req.body.update;
  sender = req.body.sender;
  receiver = req.body.receiver;

  FriendRequestNotification
    .updateMany({ _id: { "$in": ids } }, update)
    .then(_ => {
      if (update.accepted || update.declined) {
        const action = update.accepted ? "accepted" : "declined";
        let alert = {};
        alert.receiver = sender._id;
        alert.body = `${receiver.firstName + " " + receiver.lastName + " " + action} your friend request!`;

        new Alert(alert)
          .save()
          .then(_ => {
            res.status(200).send();
          })
          .catch(err => {
            logger.error('Internal Database Query Failure - Could Not Create Alerts', {
              error: err,
              date: new Date
            });
            res.status(500).send();
          });

      } else {
        res.status(200).send();
      }
    })
    .catch(err => {
      logger.error('Internal Database Query Failure - Could Not Update Friend Requests', {
        ids: ids,
        error: err,
        date: new Date
      });
      res.status(500).send();
    })
});

router.get('/alerts', withAuth, (req, res) => {
  let sessionId = "";
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      sessionId = decoded.id;
    }
  });

  Alert
    .find({ receiver: sessionId })
    .sort({ '_id': -1 })
    .then(alerts => {
      res.status(200).send(alerts);
    })
    .catch(err => {
      logger.error('Internal Database Query Failure - Could Not Fetch Alert For User', {
        userId: sessionId,
        error: err,
        date: new Date
      });
      res.status(500).send();
    })
});


router.get('/friendRequests', withAuth, (req, res) => {
  let sessionId = "";
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      sessionId = decoded.id;
    }
  });

  FriendRequestNotification
    .find({ receiver: sessionId })
    .sort({ '_id': -1 })
    .populate('sender')
    .populate('receiver')
    .then(notifications => {
      res.status(200).send(notifications);
    })
    .catch(err => {
      logger.error('Could not get friend request notifications for user', {
        userId: sessionId,
        error: err,
        date: new Date
      });
      res.status(500).send();
    })
});

module.exports = router;
