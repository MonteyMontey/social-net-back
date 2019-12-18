const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const withAuth = require('../helpers/withAuth');
const jwt = require('jsonwebtoken');

const logger = require('../helpers/logger');

// Load models
require('../models/Post');
const Post = mongoose.model('posts');
require('../models/User');
const User = mongoose.model('users');


// Read Posts
router.get('/', withAuth, (req, res) => {

  let query = {};
  query = req.query.oldestFetchedPostID ? { ...query, _id: { $lt: req.query.oldestFetchedPostID }} : query;
  query = req.query.userID ? {...query, user: req.query.userID} : query;

  Post
    .find(query)
    .sort({ '_id': -1 })
    .limit(parseInt(req.query.numberOfPostsToFetch, 10))
    .populate('user')
    .then(posts => {
      res.send(posts);
    })
    .catch(err => {
      logger.error("Failed to get posts from MongoDB", {
        date: new Date(),
        error: err
      });
      res.status(500).send();
    })
});

// Create Post
router.post('/', withAuth, (req, res) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token;

  let postData = req.body;
  
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      postData.user = decoded.id;
    }
  });

  new Post(postData)
    .save()
    .then(post => {
      logger.info('Successfully saved posts to MongoDB', {
        post: post,
        date: new Date
      });
      post.populate('user').execPopulate()
        .then(populatedPost => {
          res.status(201).send(populatedPost);
        })
        .catch(err => {
          logger.error('Saved post to database but could not populate post', {
            post: post,
            error: err,
            date: new Date()
          });
          res.status(500).send();
        })
    })
    .catch(err => {
      logger.error('Could not save post to MongoDB', {
        error: err,
        date: new Date()
      });
      res.status(500).send();
    });
});


module.exports = router;
