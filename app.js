const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const withAuth = require('./app/helpers/withAuth');
const dotenv = require('dotenv');
const cors = require('cors');

// Initialize express
const app = express();

// Load env variables
dotenv.config();

// Cross origin resource sharing
// const corsOptions = {
//   origin: process.env.CORS_ORIGIN,
//   optionsSuccessStatus: 200
// }

// Load routes
const posts = require('./app/routes/posts');
const users = require('./app/routes/users');
const login = require('./app/routes/login');
const neo4j = require('./app/routes/neo4j');
const notifications = require('./app/routes/notifications');

// Connect to mongoose
mongoose.connect(process.env.MONGODB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.log(err));

// CORS
//app.use(cors(corsOptions));
//app.use(cors());

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
app.use('/notifications', notifications);

app.get('/', function (req, res) {
  res.send('<h1>Social Network</h1>');
});

app.get('/checkToken', withAuth, function (req, res) {
  res.sendStatus(200);
});


// Start server
const port = 5333;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
