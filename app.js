const express = require('express')
const appErorr = require('./utils/appErorr')
const passport = require('passport')
require('./OAuth/googleStrategy')

const globalErrorHandler = require('./controllers/errorController')
const userRouter = require('./Routes/userRoute')
const authRouter = require('./Routes/authRoute')
const reviewRouter = require('./Routes/reviewRoute')
const githubRouter = require('./Routes/githubRoute')

const app = express()

app.use(passport.initialize())

app.use(express.json({ limit: '10kb' }))

app.use('/api/v1/users', userRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/review', reviewRouter)
app.use('/api/v1/github', githubRouter)

app.use((req, res, next) => {
    next(new appErorr(`can't find ${req.originalUrl} on this server!`, 404))
})
//Global Error Handling Middleware
app.use(globalErrorHandler)
module.exports = app