const express = require('express')
const appErorr = require('./utils/appErorr')
const passport = require('passport')
require('./OAuth/googleStrategy')

const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const hpp = require('hpp')
const cors = require('cors')

const globalErrorHandler = require('./controllers/errorController')
const userRouter = require('./Routes/userRoute')
const authRouter = require('./Routes/authRoute')
const reviewRouter = require('./Routes/reviewRoute')
const githubRouter = require('./Routes/githubRoute')

const app = express()

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'CodeLens AI API is running'
    });
});
app.set('trust proxy', 1);
app.use(passport.initialize())

app.use(express.json({ limit: '10kb' }))

// Security
app.use(helmet());
app.use(cors());

// Rate Limiting
// const limiter = rateLimit({
//     max: 100,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too many requests from this IP, please try again in an hour'
// });
// app.use('/api', limiter);

app.use(hpp());

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