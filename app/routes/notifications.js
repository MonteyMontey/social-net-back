const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const withAuth = require('../helpers/withAuth');

// Load models
require('../models/Notification');
const Notification = mongoose.model('notifications');

router.post('/', withAuth, (req, res) => {
  ids = req.body;

  Notification.updateMany({ _id: {"$in": ids} }, { isRead: true })
    .then(_ => {
      console.log("updated notification read status")
      res.status(200).send();
    })
    .catch(err => {
      console.log(err);
      res.status(500).send();
    })
});

router.get('/', withAuth, (req, res) => {

  let sessionId = "";
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      sessionId = decoded.id;
    }
  });

  Notification
    .find({ receiver: sessionId })
    .populate('sender')
    .populate('receiver')
    .then(notification => {
      res.status(200).send(notification);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send();
    })
});

module.exports = router;
