const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const withAuth = require('../helpers/withAuth');

// Load models
require('../models/FriendRequestNotification');
const FriendRequestNotification = mongoose.model('friendRequestNotifications');

router.put('/friendRequests', withAuth, (req, res) => {
  ids = req.body.ids;
  update = req.body.update;

  FriendRequestNotification.updateMany({ _id: { "$in": ids } }, update)
    .then(_ => {
      console.log("updated friend request notifications")
      res.status(200).send();
    })
    .catch(err => {
      console.log(err);
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
    .limit(5)
    .populate('sender')
    .populate('receiver')
    .then(notifications => {
      res.status(200).send(notifications);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send();
    })
});

module.exports = router;
