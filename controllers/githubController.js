const axios = require('axios')
const appErorr = require('../utils/appErorr')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const { reviewCode } = require("../services/aiService");
const { reviewRepository } = require("../services/aiService");
const CodeChunker = require('../utils/codeChunker')
const Review = require('../models/reviewModel')

exports.getMyRepositories = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+githubAccessToken')

    console.log(user)
    if (!user.githubAccessToken) return next(new appErorr('GitHub account is not connected', 400))

    const response = await axios.get(
        'https://api.github.com/user/repos', {
        headers: {
            Authorization: `Bearer ${user.githubAccessToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2026-03-10'
        }
    }
    )

    const repos = response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        defaultBranch: repo.default_branch,
        url: repo.html_url
    }))

    res.status(200).json({
        status: 'success',
        results: repos.length,
        data: {
            repos
        }
    })
})
const allowedExtensions = [
    '.js',
    '.ts',
    '.py',
    '.java',
    '.cpp',
    '.c',
    // '.css',
    // '.html'
]

const isAllowedFile = (filename) => {
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase()
    return allowedExtensions.includes(extension)
}
const getFileContent = async (owner, repo, path, accessToken) => {
    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2026-03-10'
            }
        }
    )

    const content = response.data.content
    const decodedContent = Buffer.from(content, 'base64').toString('utf8')
    return decodedContent
}
/*
{
response :
    "name": "authController.js",
    "path": "controller/authController.js",
    "type": "file",
    "encoding": "base64",
    "content": "Y29uc3Qg..."
}

*/
const getFolderContent = async (owner, repo, path, accessToken, files) => {
    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2026-03-10'
            }
        }
    )

    for (const item of response.data) {
        if (item.type === "file" && isAllowedFile(item.name)) {
            const content = await getFileContent(owner, repo, item.path, accessToken)
            files.push({
                name: item.name,
                path: item.path,
                content
            })
        } else if (item.type === 'dir') {
            await getFolderContent(owner, repo, item.path, accessToken, files)
        }
    }

    return files
}

exports.getRepository = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+githubAccessToken')

    if (!user.githubAccessToken) return next(new appErorr('GitHub account is not connected', 400))

    const response = await axios.get(
        `https://api.github.com/repos/${req.params.owner}/${req.params.repo}/contents`,
        {
            headers: {
                Authorization: `Bearer ${user.githubAccessToken}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2026-03-10'
            }
        }
    )
    let files = []
    for (const item of response.data) {
        if (item.type === "file" && isAllowedFile(item.name)) {
            const content = await getFileContent(req.params.owner, req.params.repo, item.path, user.githubAccessToken)
            files.push({
                name: item.name,
                path: item.path,
                content
            })
        } else if (item.type === "dir") {
            await getFolderContent(
                req.params.owner,
                req.params.repo,
                item.path,
                user.githubAccessToken,
                files
            )
        }
    }
    console.log(`Found files: ${files.length}`)
    const fileReviews = []
    for (const file of files) {
        const data = await reviewCode(
            file.content,
            'javascript',
            file.path
        )

        fileReviews.push({
            file: file.path,
            summary: data.summary,
            score: data.score,
            issues: data.issues
        })

    }

    const finalReview = await reviewRepository(fileReviews)

    const review = await Review.create({

        user: req.user.id,

        source: 'repo',

        fileName: `${req.params.owner}/${req.params.repo}`,

        aiReview: {
            summary: finalReview.summary,
            issues: finalReview.issues
        },

        score: finalReview.score,

        status: 'completed'
    })

    res.status(200).json({
        status: 'success',
        review
    })

})

// const data = {
//     repository: `${req.params.owner}/${req.params.repo}`,
//     contents: response.data.map(item => ({
//         name: item.name,
//         path: item.path,
//         type: item.type,
//         url: item.html_url
//     }))
// }