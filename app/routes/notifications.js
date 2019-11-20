const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const withAuth = require('../helpers/withAuth');

// Load models
require('../models/Notification');
const Notification = mongoose.model('notifications');


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
    .then(notification => {
      res.status(200).send(notification);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send();
    })
});

module.exports = router;
