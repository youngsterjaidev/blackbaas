const express = require("express")
const app = express()
const path = require("path")
const morgan = require("morgan")
const cors = require("cors")
const bodyParser = require("body-parser")

const usersRoute = require("./api/users.router")
const adminRoute = require("./api/admin/admin.router")

// Middlewares
app.use(morgan("dev"))
app.use(cors({ origin: "*" }))
//app.use(express.static("uploads"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use("/users", usersRoute)

app.use("/admin", adminRoute)

app.get("/", (req, res) => {
    res.status(200).send("Server is running")
})

app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/test.html"))
})

module.exports = app
