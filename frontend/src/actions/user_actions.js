import * as UserApiUtil from '../util/user_api_util'

export const RECEIVE_USERS = "RECEIVE_USERS"
export const RECEIVE_USER = "RECEIVE_USER"

export const receiveUsers = (users) => ({
    type: RECEIVE_USERS,
    users
})

export const receiveUser = (user) => ({
    type: RECEIVE_USER,
    user
})

export const fetchUsers = () => dispatch => UserApiUtil.getUsers()
    .then(users => dispatch(receiveUsers(users.data)))

export const updateUser = (user) => dispatch => UserApiUtil.updateUser(user)
    .then(user => dispatch(receiveUser(user.data)))