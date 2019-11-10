const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load models
require('../models/Post');
const Post = mongoose.model('posts');

// Read Posts
router.get('/', (req, res) => {
  Post.find({})
    .then(posts => {
      res.send(posts);
    })
    .catch(err => {
      console.error("Failed to fetch posts from MongoDB", err);
      res.status(500).send();
    })
});

// Create Post
router.post('/', (req, res) => {
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
