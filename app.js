const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Connect to mongoose
mongoose.connect('mongodb+srv://montey:montey@freetiercluster-wg6nd.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.log(err));

// Load model
require('./models/Registration');
const Registration = mongoose.model('registration');

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.post('/registration', (req, res) => {
  console.log("Successfully received registration data: ", req.body);
  res.status(200).send();
});


app.get('/', (req, res) => {
  res.send("Index page");
});


const port = 5000;

app.listen(port,() => {
  console.log(`Server started on port ${port}`);
});