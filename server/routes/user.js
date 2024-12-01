const express = require('express')
const router = express.Router()
const authenticate = require('../middleware/auth')
const {
    getUserProfile,
    updateUser,
    updateUserPassword,
    deleteUser,
    getUserById,
    updateUserPreferences,
} = require('../controllers/user')

router
    .route('/')
    .get(authenticate, getUserProfile)
    .post(authenticate, updateUser)
    .put(authenticate, updateUserPassword)
    .delete(authenticate, deleteUser)

router
    .route('/:id')
    .get(getUserById)

router.post('/preferences', authenticate, updateUserPreferences);

module.exports = router