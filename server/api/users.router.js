const express = require("express")

// get the middleware
const { uploadVideoMiddleware, addEntryInDatabase } = require("./users.middleware")

const {
    getAllUsers,
		delCol,
    addUser,
    deleteUser,
    getUser,
    uploadVideo,
    getVideo,
    getVideos,
    login,
    getPrivateVideo,
		delDB
} = require("./users.controller")

const router = express.Router()

// ROUTES
router.route("/").get(getAllUsers)

router.route("/delCol").delete(delCol)

router.route("/add").post(addUser)
router.route("/delete").delete(deleteUser)

router.route("/uploads").post(uploadVideoMiddleware.single("video"), addEntryInDatabase, uploadVideo)
router.route("/userId/:userId").get(getUser)
router.route("/uploads/:videoPath").get(getVideo)
router.route("/private-video/:email").get(getPrivateVideo)

router.route("/videos").get(getVideos)

router.route("/login").post(login)
router.route("/delDB").get(delDB)

// For the testing purpose
router.post("/test", (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

// exporting the router module
module.exports = router
