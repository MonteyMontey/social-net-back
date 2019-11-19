const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const withAuth = require('./app/helpers/withAuth');

// Initialize express
const app = express();

// Load routes
const posts = require('./app/routes/posts');
const users = require('./app/routes/users');
const login = require('./app/routes/login');
const neo4j = require('./app/routes/neo4j');

// Connect to mongoose
mongoose.connect('mongodb+srv://montey:montey@freetiercluster-wg6nd.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.log(err));

// Cookie parser middleware
app.use(cookieParser());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Use routes
app.use('/posts', posts);
app.use('/users', users);
app.use('/login', login);
app.use('/neo4j', neo4j);

app.get('/checkToken', withAuth, function (req, res) {
  res.sendStatus(200);
});

// Start server
const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
