const express = require("express");
const bcrypt = require('bcryptjs');
const User = require('../../models/User.js');
const router = express.Router(); // express router method to create router object...can perform middleware and routing functions
const jwt = require('jsonwebtoken'); // JSON web token so our users can actually sign in and access protected routes
const keys = require('../../config/keys');
const passport = require('passport');

// import validations
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


// test route to make sure Express is set up properly
// note -- callback for every Express route requires a request and response as args
router.get("/test", (req, res) => res.json({ msg: "This is the users route" }));


// private auth route
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email
    })
});

router.get('/', (req,res) => {
    User.find()
        .sort({lastName: -1})
        .then(users => {
            res.json(users.map(user => {return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                groups: user.groups,
                events: user.events,
                imageUrl: user.imageUrl,
                bio: user.bio,
                follows: user.follows
            }}))
        })
        .catch(err => res.status(404).json({noUsersFound: "Users were not found"}))
})


// update user route
router.patch('/:id', (req,res) => {

    User.findById(req.body.id)
        .then(user => {
            user.groups = req.body.groups;
            user.events = req.body.events;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.email = req.body.email;
            user.imageUrl = req.body.imageUrl; 
            user.bio = req.body.bio;
            user.follows = req.body.follows;

            return user.save().then(user => res.json(user))
        })
        .catch(err => res.status(404).json({noUsersFound: "Users were not found"}))
})


// register user route
router.post('/register', (req, res) => {
    // check the input against our validations
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    // Check to make sure nobody has already registered with a duplicate email
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          // Throw a 400 error if the email address already exists
          errors.email = "User already exists";
          return res.status(400).json(errors)
        } else {
          // Otherwise create a new user, save in database (after bcrypt steps)
          const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password
          })
          
          // Salt and hash our new user's password before storing it in the database and saving the user
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                    // our payload should have all the info about the user that our frontend engineers want easy access to
                    const payload = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };

                    // return jwt web token in response...we will be saving this using our application on the frontend
                    // eventually, we will send hte web token back in the header of every API request to our backend...Passport will authenticate
                    jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                        res.json({
                            succes: true,
                            token: "Bearer " + token
                        });
                    });
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
  });


  // login user route
  router.post('/login', (req, res) => {
    // check input against our validations
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        console.log(errors)
        return res.status(400).json(errors);
    }

    console.log("logging in..") // for debugging

    // we take in an email and password input from the user, which we access from our request body
    const email = req.body.email;
    const password = req.body.password;

    // search for the user in our database by email
    User.findOne({email})
        .then(user => {
            if (!user) { // if no user with that email in database...
                errors.email = "This user does not exist"
                return res.status(404).json(errors);
            }

            bcrypt.compare(password, user.password) // compares the input password with the salted and hashed password in our database
                .then(isMatch => {
                    if (isMatch) {
                        // payload should have all of the user info that we might want to access later on in the frontend
                        const payload = {id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName};

                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            {expiresIn: 3600},
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            });
                    } else {
                        errors.password = "Incorrect password";
                        return res.status(404).json(errors);
                    }
                });
        });
  });




module.exports = router;

