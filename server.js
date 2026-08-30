const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const app = require('./app')
const mongoose = require('mongoose')

const PORT = process.env.PORT || 5000
const DB = process.env.DB

mongoose.connect(DB).then(() => console.log("DB connection successfully"))
    .catch(err => console.log(err))

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

