const express = require("express");
const keys = require('../../config/keys');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose')
const Schema = mongoose.Schema


const validateEventInput = require('../../validation/events');
const User = require("../../models/User");
const Group = require('../../models/Group');
const Event = require('../../models/Event');

router.get('/test', (req, res) => res.json({msg: "This is the events route"}));

// INDEX action
router.get('/', (req, res) => {
    Event.find()
        .then(events => res.json(events))
        .catch(err => res.status(404).json({ noEventsFound: 'No events found' }))
});

// SHOW action
router.get('/:id', (req, res) => {
    Event.findById(req.params.id)
        .then(event => res.json(event))
        .catch(err => res.status(404).json( { noEventFound: 'No event found with that ID' } ))
});

// USERS INDEX action
router.get('/users/:user_id', (req, res) => {
    Event.find( {users: req.params.user_id} )
        .then(events => res.json(events))
        .catch(err => 
            res.status(404).json({ noEventsFound: 'This user does not have any events' })
        )
});

router.get('/groups/:group_id', (req,res) => {
    Event.find().then(events => console.log(events))
    let query = {
        groupId: req.params.group_id
    }
    Event.find( {groupId: { $ne: null }})
        .then(events => {
            let groupEvents = []
            events.forEach(event => {
                if (event.groupId.toString() === req.params.group_id){
                    groupEvents.push(event)
                }
            })
            res.json(groupEvents)
        })
        .catch(err =>
            res.status(404).json({noEventsFound: 'No events found for that group'})    
        )
})

router.patch('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateEventInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors)
    }


    Event.findById(req.body.id)
        .then(event => {
            event = event || req.body
            event.courseId = req.body.courseId;
            if (!event.groupId){
                delete event.groupId
            }
            event.public = req.body.public ? req.body.public : true;
            event.eventSize = req.body.eventSize;
            event.eventTime = new Date(req.body.eventTime); 
            event.users = req.body.users;
            event.description = req.body.description;
            event.name = req.body.name ? req.body.name : "New Event"; 
            
            return event.save().then(event => res.json(event)).catch(err => console.log(err))
        })
        .catch(err => res.status(404).json( { noEventFound: "No event found with that ID"} ))
});


router.post('/',passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateEventInput(req.body);

    if (!isValid){``
        return res.status(400).json(errors)
    }


    const newEvent = new Event({
        courseId: req.body.courseId,
        ownerId: req.user.id,
        users: [req.user.id],
        eventTime: new Date(req.body.eventTime),
        eventSize: req.body.eventSize,
        name: req.body.name ? req.body.name : "New event",
        description: req.body.description ? req.body.description : "",
        public: req.body.public ? req.body.public : true,
    })

    if (req.body.groupId) {
        newEvent.groupId = req.body.groupId
    }

    newEvent.save().then( event => {
        if (event.groupId){
            Group.findById(event.groupId)
                .then(group => {
                    if (group.events.indexOf(event.id) < 0){
                        group.events.push(event.id);
                        group.save()
                    }
                })
        }
        req.user.events.createdEvents.push(event.id)
        req.user.events.joinedEvents.push(event.id)
        req.user.save()
        res.json(event)
    })

});


router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Event.findById(req.params.id)
        .then(event => {

            if (event.ownerId.toString() !== req.user.id) {
                return res.status(401).json( {unauthorized: 'Only the owner can delete this event.' })
            } 

            Event.findByIdAndDelete(event.id, function(err){
                if (err) console.log(err);
                console.log("Successful deletion.")
            })
            return res.status(200).json({deleted: "true"})
        })
        .catch(err => res.status(404).json( { noEventFound: "No event found with that ID"} ))
})

module.exports = router;
