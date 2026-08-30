const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "user must have name"],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, "user must have Email"],
        lowercase: true,
        validate: [validator.isEmail, "please provied a valid email"]
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubUsername: {
        type: String,
        trim: true
    },
    githubAccessToken: {
        type: String,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        // required: [true, "please provied a password"],
        select: false,
        minlength: [8, 'Password must be at least 8 characters']
    },
    passwordConfirm: {
        type: String,
        // required: [true, "please confirm your password"],
        validate: {
            validator: function (val) {
                return val === this.password
            },
            message: "Password is not the same!!"
        },
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
},
    {
        timestamps: true
    }
)

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
})

userSchema.pre('save', async function () {
    if (!this.isModified('password') || this.isNew) return;

    this.passwordChangeAt = Date.now() - 1000;
})

userSchema.methods.changedPasswordAfter = function (JWTtimeStamp) {
    if (this.passwordChangeAt) {
        // JWT iat is stored in seconds, so convert passwordChangedAt from milliseconds to seconds
        const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10)

        return JWTtimeStamp < changedTimestamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function () {
    const reseToken = crypto.randomBytes(32).toString('hex')// create random 32 bytes

    this.passwordResetToken = crypto.createHash('sha256').update(reseToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return reseToken
}


userSchema.pre(/^find/, function () {
    this.find({ active: { $ne: false } })
})


const User = mongoose.model('User', userSchema)
module.exports = User