const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const withAuth = require('../helpers/withAuth');

// Load models
require('../models/Post');
const Post = mongoose.model('posts');

// Read Posts
router.get('/', withAuth, (req, res) => {

  Post
    .find(req.query.oldestFetchedPostID ? { _id: { $lt: req.query.oldestFetchedPostID } } : {})
    .sort({ '_id': -1 })
    .limit(parseInt(req.query.numberOfPostsToFetch, 10))
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
  let postData = req.body;

  new Post(postData)
    .save()
    .then(post => {
      console.log("Successfully saved posts to MongoDB\n", post);
      res.status(200).send();
    })
    .catch(err => {
      console.error("Failed to save post data to MongoDB", err);
      res.status(500).send();
    });
});


module.exports = router;
