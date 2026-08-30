const express = require('express')

const githubController = require('../controllers/githubController')
const authController = require('../controllers/authController')

const githubRouter = express.Router()

githubRouter.get('/repos', authController.protect, githubController.getMyRepositories)

githubRouter.get('/repos/:owner/:repo', authController.protect, githubController.getRepository)

module.exports = githubRouter