const User = require('../models/userModel')
const appErorr = require('../utils/appErorr')
const catchAsync = require('../utils/catchAsync')

// Admin ---------------------------------------------
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const allUser = await User.find()

    res.status(200).json({
        status: 'sucess',
        data: allUser
    })
})

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) { return next(new appErorr("there is no user with this ID", 404)) }

    res.status(200).json({
        status: "success",
        data: user
    })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) { return next(new appErorr("there is no user with this ID", 404)) }

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.promoteToAdmin = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: "admin" },
        {
            new: true,
            runValidators: true
        }
    )
    if (!user) { return next(new appErorr("there is no user with this ID", 404)) }
    res.status(200).json({
        status: "success",
        data: user
    })
})


//---------------------------------------------------------------------------------


//user----------------------------------------------------------------------------

exports.getMe = catchAsync(async (req, res, next) => {
    req.params.id = req.user.id
    next()
})

exports.updateMe = catchAsync(async (req, res, next) => {

    if (req.body.password || req.body.passwordConfirm) {
        return next(new appErorr('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    const updateData = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.photo !== undefined) updateData.photo = req.body.photo;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.user.id)

    res.status(204).json({
        status: "success",
        data: null
    })
})



