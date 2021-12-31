const express = require("express")
const app = express()
const port = process.env.PORT || 8000

app.get("/", (req ,res) => {
    res.send("Server has been started !")
})

app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})