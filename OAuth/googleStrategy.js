const passport = require('passport')
const axios = require('axios');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const User = require('../models/userModel')

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },

        async (accessToken, refreshToken, profile, done) => {
            //check if user signup with google before
            const user = await User.findOne({ googleId: profile.id })
            if (user) {
                return done(null, user)
            }

            //if user signup with normal ways (email - password)
            const existingUser = await User.findOne({ email: profile.emails[0].value })
            if (!existingUser) {
                const newUser = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    authProvider: 'google'
                })
                return done(null, newUser)
            }
            existingUser.googleId = profile.id
            existingUser.authProvider = 'google'
            await existingUser.save()
            return done(null, existingUser)
        }
    )
)

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            //check if user signup with Github before
            const user = await User.findOne({ githubId: profile.id });
            if (user) {
                user.githubAccessToken = accessToken;
                user.githubUsername = profile.username;

                await user.save();

                return done(null, user);
            }

            // GitHub email
            const response = await axios.get(
                'https://api.github.com/user/emails',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/vnd.github+json'
                    }
                }
            );

            const email = response.data.find(
                email => email.primary
            )?.email;

            if (!email) {
                return done(new Error('GitHub account does not have an email'), null);
            }

            // Check if user already exists with same email
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                const newUser = await User.create({
                    name: profile.displayName || profile.username,
                    email,
                    githubId: profile.id,
                    githubUsername: profile.username,
                    githubAccessToken: accessToken,
                    authProvider: 'github'
                });

                return done(null, newUser);
            }

            // Existing local/google user
            existingUser.githubId = profile.id;
            existingUser.githubUsername = profile.username;
            existingUser.githubAccessToken = accessToken;
            existingUser.authProvider = 'github';

            await existingUser.save();
            return done(null, existingUser);
        }
    )
)
/*
    inside response comming from axios :

    {
    data: [
        {
            email: "eslam@example.com",
            primary: true,
            verified: true,
            visibility: null
        }
    ],

    status: 200,
    }
*/

/*
-inside profile : 
    profile.id
    profile.displayName
    profile.emails
    profile.photos
*/