const express = require('express')
const passport = require('passport')
const authController = require('../controllers/authController')


const authRouter = express.Router()

authRouter.get('/google', passport.authenticate("google", {
    scope: ['profile', 'email']
}))

authRouter.get('/google/callback', passport.authenticate('google', {
    session: false
}), authController.oauthCallback)

authRouter.get('/github', passport.authenticate("github", {
    scope: ['user:email']
}))

authRouter.get('/github/callback', passport.authenticate('github', {
    session: false
}), authController.oauthCallback)

module.exports = authRouter