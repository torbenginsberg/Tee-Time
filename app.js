const express = require("express");
const mongoose = require('mongoose');

//Routes
const users = require("./routes/api/users");
const groups = require("./routes/api/groups");
const courses = require("./routes/api/courses")
const events = require("./routes/api/events");

// Or app is using Passport to authenticate our token and construct private routes (login, register, etc.)
const passport = require('passport');
const path = require('path');


const app = express(); // creating our Express server
app.use(passport.initialize()); // adding middleware for Passport
require('./config/passport')(passport); // setting up a configuration file for Passport


if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  })
};



// tell our app which port to run on...process.env.PORT is required for Heroku
const port = process.env.PORT || 5000;

// tell Express to start a socket and listen for connections on the path, with a helpful log message for us
app.listen(port, () => console.log(`Server is running on port ${port}`)); 


// import our key
const db = require(`./config/keys`).mongoURI;

// connects to MongoDB using Mongoose
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));


// body parsing middleware for Node.js
// allows us to parse the JSON that we send to our frontend
const bodyParser = require('body-parser');
//setting up body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// tell Express to use our routes
// for the arguments...essentially saying that only requests to "/api/users" will be sent to users route
app.use("/api/users", users);
app.use("/api/groups", groups);
app.use("/api/courses", courses);
app.use("/api/events", events);
