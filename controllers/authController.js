const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { promisify } = require('util')
const crypto = require('crypto')

const User = require('../models/userModel')
const appErorr = require('../utils/appErorr')
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('./../utils/email')

const createSendToken = (user, statusCode, res) => {
    //create a token 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })

    // Assign cookie -----------------
    const expires = new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )

    const cookieOption = {
        expires,
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        cookieOption.secure = true //https
    }
    res.cookie('jwt', token, cookieOption)
    //----------------------

    //remove password from output
    user.password = undefined;


    //send the response
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })
    createSendToken(newUser, 200, res)
})


exports.login = catchAsync(async (req, res, next) => {
    //1) Check if email and password is exist in req.body
    if (!req.body.email || !req.body.password) return next(new appErorr('please provide email and password!', 400))

    //2) Check if user exist && password is correct
    const user = await User.findOne({ email: req.body.email }).select("+password")

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new appErorr('Incorrect Email or Password', 401))
    }

    createSendToken(user, 200, res)
})

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        status: "success",
        message: 'You logged out successfully'
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return next(new appErorr('you are not logged in! please log in to get access', 401))

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)//decoded = {id: "6a4668d854657d6d281a2e3e",iat: 1783000000,exp: 1790000000}

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next(new appErorr('the user belonging to this token is no longer exist.', 401))

    // 4) Check if user changed password after token
    if (currentUser.changedPasswordAfter(decoded.iat))
        return next(new appErorr('User recently change password! please log in again.', 401));

    // 5) Grant access
    req.user = currentUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appErorr("you don't have the permission to perform this action.", 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get user based in posted email
    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(new appErorr("there is no user with email address.", 404))

    //2) generate the random token
    const reseToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) send it to user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${reseToken}`
    const message = `Forgot your password?\nSubmit a PATCH request with your new password and passwordConfirm to:
    \n${resetUrl}\n
If you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false });
        return next(new appErorr("There was an error sending the email. Try again later!", 500))
    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1)get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    console.log('HASHED TOKEN:', hashedToken)

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gte: Date.now() }
    })

    //2)if token is valid and user is exist , set the new password
    if (!user) return next(new appErorr("Token is invalid or has expired.", 400))

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save()

    //4)log the user in,send JWT

    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    if (!(await bcrypt.compare(req.body.passwordCurrent, user.password))) {
        return next(new appErorr("Your current password is wrong.", 401))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, res);
})


exports.oauthCallback = catchAsync(async (req, res, next) => {
    createSendToken(req.user, 200, res)
})
