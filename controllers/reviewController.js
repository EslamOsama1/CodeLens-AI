const Review = require('../models/reviewModel')
const appErorr = require('../utils/appErorr')
const catchAsync = require('../utils/catchAsync')
const { reviewCode } = require("../services/aiService");
const multer = require('multer')

//file Upload

const multerStorgae = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    const allowedExtensions = [
        '.js',
        '.ts',
        '.py',
        '.java',
        '.cpp',
        '.c'
    ]

    const fileExtension = file.originalname
        .substring(file.originalname.lastIndexOf('.'))
        .toLowerCase()


    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true)
    } else {
        cb(new appErorr('Only code files are allowed', 400), false)
    }
}

const upload = multer({
    storage: multerStorgae,
    fileFilter: multerFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB
    }
})

exports.fileCode = upload.single('code')


exports.createReview = catchAsync(async (req, res, next) => {
    if (!req.body.code || !req.body.language) {
        return next(new appErorr('please provide code and language'))
    }

    const response = await reviewCode(req.body.code, req.body.language)

    const review = await Review.create({

        user: req.user.id,
        code: req.body.code,
        language: req.body.language,

        aiReview: {
            summary: response.summary,
            issues: response.issues
        },

        score: response.score,

        status: 'completed'
    })

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    });
})

exports.uploadReview = catchAsync(async (req, res, next) => {
    if (!req.file) return next(new appErorr('Please upload a code file', 400))

    const extension = req.file.originalname
        .substring(req.file.originalname.lastIndexOf('.') + 1)
        .toLowerCase()

    const languageMap = {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        go: 'go'
    }

    const language = languageMap[extension]

    const code = req.file.buffer.toString('utf-8')
    const response = await reviewCode(code, language)

    const review = await Review.create({

        user: req.user.id,
        code: code,
        language: language,
        source: 'file',

        aiReview: {
            summary: response.summary,
            issues: response.issues
        },

        score: response.score,

        status: 'completed'
    })

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    });
})

exports.getAllReview = catchAsync(async (req, res, next) => {
    const allReviews = await Review.find()

    res.status(200).json({
        status: 'sucess',
        resulte: allReviews.length,
        data: allReviews
    })
})

exports.getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) { return next(new appErorr("there is no review with this ID", 404)) }

    res.status(200).json({
        status: "success",
        data: review
    })
})


exports.getMyReview = catchAsync(async (req, res, next) => {
    const myReviews = await Review.find({
        user: req.user.id
    });;

    if (!myReviews) { return next(new appErorr("you don't have any Reviews", 404)) }

    res.status(200).json({
        status: "success",
        resulte: myReviews.length,
        data: myReviews
    })
})

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id)

    if (!review) { return next(new appErorr("there is no review with this ID", 404)) }

    if (
        req.user.role !== 'admin' &&
        review.user.toString() !== req.user.id
    ) {
        return next(
            new appErorr("You are not allowed to delete this review", 403)
        );
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: "success",
        data: null
    });
})