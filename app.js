const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const registrationValidation = require('./app/helpers/registrationValidation');

const app = express();

// Connect to mongoose
mongoose.connect('mongodb+srv://montey:montey@freetiercluster-wg6nd.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.log(err));

// Load model
require('./app/models/Registration');
const Registration = mongoose.model('registration');

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.post('/registration', (req, res) => {
  let registrationData = req.body;
  console.log("Successfully received registration data:\n", registrationData);

  if (registrationValidation.isRegistrationValid(registrationData)) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(registrationData.password, salt, (err, hash) => {
        if (err) throw err;
        registrationData.password = hash;

        new Registration(registrationData)
          .save()
          .then(registration => {
            console.log("Successfully saved registration data to MongoDB\n", registration);
            res.status(200).send();
          })
          .catch(err => {
            console.error("Failed to save registration data to MongoDB", err);
            res.status(500).send();
          })
      });
    });

  } else {
    console.error("Invalid registration data")
    res.status(400).send();
  }
});

app.get('/', (req, res) => {
  res.send("Index page");
});


const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});