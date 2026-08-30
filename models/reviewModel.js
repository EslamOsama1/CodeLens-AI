const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    code: {
        type: String,
        required: function () {
            return this.source !== 'repo'
        }
    },
    language: {
        type: String,
        required: false,
        enum: ['javascript', 'python', 'java', 'cpp', 'go', 'html', 'css']
    },
    source: {
        type: String,
        enum: ['text', 'file', 'repo'],
        default: 'text'
    },

    fileName: {
        type: String
    },

    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    aiReview: {
        summary: String,
        issues: [
            {
                file: {
                    type: String,
                    required: true
                },
                line: {
                    type: Number,
                    required: false
                },
                severity: {
                    type: String,
                    enum: ['low', 'medium', 'high', 'critical'],
                    required: true
                },
                title: String,
                description: String,
                suggestion: String
            }
        ]
    },
    score: {
        type: Number,
        min: 0,
        max: 10
    }
},
    {
        timestamps: true
    }
)

reviewSchema.pre(/^find/, function () {
    this.populate({
        path: "user",
        select: "name email"
    });
});

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review