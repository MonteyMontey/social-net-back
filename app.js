const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize express
const app = express();

// Load routes
const posts = require('./app/routes/posts');
const users = require('./app/routes/users');

// Connect to mongoose
mongoose.connect('mongodb+srv://montey:montey@freetiercluster-wg6nd.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.log(err));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Use routes
app.use('/posts', posts);
app.use('/users', users);

// Start server
const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
