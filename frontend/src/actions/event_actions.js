import * as EventApiUtil from '../util/events_api_util';

export const RECEIVE_EVENT = "RECEIVE_EVENT";
export const RECEIVE_EVENTS = "RECEIVE_EVENTS";
export const REMOVE_EVENT = "REMOVE_EVENT";

export const receiveEvent = (event) => ({
    type: RECEIVE_EVENT,
    event
})

export const receiveEvents = (events) => ({
    type: RECEIVE_EVENTS,
    events
})

export const removeEvent = (eventId) => ({
    type: REMOVE_EVENT,
    eventId
})

export const fetchEvent = (eventId) => dispatch => EventApiUtil.getEvent(eventId)
    .then(event => dispatch(receiveEvent(event)));

export const createEvent = (event) => dispatch => EventApiUtil.createEvent(event)
    .then(event => dispatch(receiveEvent(event)));

export const updateEvent = (event) => dispatch => EventApiUtil.updateEvent(event)
    .then(event => dispatch(receiveEvent(event)));

export const deleteEvent = (eventId) => dispatch => EventApiUtil.deleteEvent(eventId)
    .then(() => dispatch(removeEvent(eventId)));

export const fetchUserEvents = (userId) => dispatch => EventApiUtil.getUserEvents(userId)
    .then(events => dispatch(receiveEvents(events)));