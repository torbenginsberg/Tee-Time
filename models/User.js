//in Mongoose, models are defined by passing a schema instance to mongoose.model, which we do in our export at the bottom of this file

const mongoose = require('mongoose');
const Schema = mongoose.Schema; // accessing the Schema constructor from the mongoose singleton

const UserSchema = new Schema({
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    skillLevel: {
      type: String
    },
    location: {
      city: {
        type: String
      },
      state: {
        type: String
      }
    },
    groups: {         // for groups and events, we could define document within document by setting the value of our array with the respective schema constructor inside
      ownedGroups: {
        type: Array
      },
      joinedGroups: {
        type: Array
      }
    },
    events: {
      createdEvents: {
        type: Array
      },
      joinedEvents: {
        type: Array
      }
    },
    imageUrl: {
      type: String
    },
    bio: {
      type: String
    },
    follows: {
      followers: {
        type: Array
      },
      following: {
        type: Array
      }
    }
    // might want to add image down the line
  }, {
    timestamps: true
})

module.exports = User = mongoose.model('User', UserSchema);