const express = require("express");
const Group = require('../../models/Group');
const keys = require('../../config/keys');
const passport = require('passport');
const router = express.Router();

const validateGroupInput = require('../../validation/groups');
const User = require("../../models/User");

// test route
router.get('/test', (req, res) => res.json({msg: "This is the groups route"}))


// get Groups route
router.get('/', (req, res) => {
    Group.find()
        .sort({ date: -1 })
        .then(groups => res.json(groups))
        .catch(err => res.status(404).json({ noGroupsFound: 'No groups found'}))
});


// get Group route
router.get('/:id', (req, res) => {
    Group.findById(req.params.id)
        .then(group => res.json(group))
        .catch(err => res.status(404).json( { noGroupFound: "No group found with that ID"} ))
});


// get a User's groups route
router.get('/users/:user_id', (req, res) => {
    Group.find({users: req.params.user_id})
        .then(groups => res.json(groups))
        .catch(err => 
            res.status(404).json({ noGroupsFound: "This user does not belong to any groups yet." }) 
        )
});


// update group route
router.patch('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateGroupInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors)
    }

    Group.findById(req.params.id)
        .then(group => {
            if (group.ownerId.toString() !== req.user.id) {
                return res.status(401).json( {unauthorized: 'Only the owner can update this group.' })
            } else {
                group.name = req.body.name;
                group.description = req.body.description;
                if (req.body.users){
                    group.users = req.body.users;
                }
                if (req.body.location){
                    group.location = req.body.location;
                }
                return group.save().then(group => res.json(group))
            }
        })
        .catch(err => res.status(404).json( { noGroupFound: "No group found with that ID"} ))
})


// create Group route
router.post('/',passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateGroupInput(req.body);

    if (!isValid){
        console.log(errors)
        return res.status(400).json(errors)
    }

    const newGroup = new Group({
        name: req.body.name,
        description: req.body.description,
        ownerId: req.user.id,
        users: req.body.users
    })

    newGroup.save().then( group => {
        req.user.groups.ownedGroups.push(group.id)
        group.users.forEach(userId => {
            User.findById(userId)
                .then(user => {
                    if (user.groups.joinedGroups.indexOf(group.id) < 0){
                        user.groups.joinedGroups.push(group.id)
                    }
                    user.save()
                }).catch(err => console.log("Error"))
        })
        
        req.user.save()
        res.json(group)
    })

});


// delete Group route
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    
    console.log(req.params.id)
    Group.findById(req.params.id)
        .then(group => {

            if (group.ownerId.toString() !== req.user.id) {
                return res.status(401).json( {unauthorized: 'Only the owner can delete this group.' })
            } 

            
            Group.findByIdAndDelete(group.id, function(err){
                if (err) console.log(err);
                console.log("Successful deletion.")
            })
            return res.status(200).json({deleted: "true"})
        })
        .catch(err => res.status(404).json( { noGroupFound: "No group found with that ID"} ))
})


module.exports = router;