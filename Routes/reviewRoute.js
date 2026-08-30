const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')


const reviewRouter = express.Router()

reviewRouter.use(authController.protect)
reviewRouter.get('/my-reviews', reviewController.getMyReview)
reviewRouter.post('/upload-file', reviewController.fileCode, reviewController.uploadReview)


reviewRouter.route('/')
    .get(authController.restrictTo('admin'), reviewController.getAllReview)
    .post(reviewController.createReview)

reviewRouter.route('/:id')
    .get(authController.restrictTo('admin'), reviewController.getReview)
    .delete(reviewController.deleteReview)



module.exports = reviewRouter