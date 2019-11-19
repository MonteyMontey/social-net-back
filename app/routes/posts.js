const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const withAuth = require('../helpers/withAuth');
const jwt = require('jsonwebtoken');

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
      console.error("Failed to fetch posts from MongoDB", err);
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
      console.log("Successfully saved posts to MongoDB\n", post);
      post.populate('user').execPopulate()
        .then(populatedPost => {
          res.status(200).send(populatedPost);
        })
        .catch(err => {
          console.log("Saved to database but couldn't populate post", err);
          res.status(500).send();
        })
    })
    .catch(err => {
      console.error("Failed to save post data to MongoDB", err);
      res.status(500).send();
    });
});


module.exports = router;
