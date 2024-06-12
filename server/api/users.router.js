const express = require("express")

// get the middleware
const { uploadVideoMiddleware, addEntryInDatabase, uploadStrategy } = require("./users.middleware")

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
  delDB,
  getAzureBlobStorage,
  postAzureBlobStorage,
	getAWSS3BucketsList,
	getCreateAWSS3Bucket,
	deleteAWSS3Bucket,
	getAWSS3BucketObjects,
	uploadAWSS3BucketObject,
  postProject,
  getProjects,
} = require("./users.controller")
const { route } = require("../server")

const router = express.Router()


// ROUTES
router.route("/").get(getAllUsers)

router.route("/delCol").delete(delCol)

router.route("/add").post(addUser)
router.route("/delete").delete(deleteUser)

router.route("/uploads").post(uploadVideoMiddleware.single("video"), addEntryInDatabase, uploadVideo)
router.route("/userId/:userId").get(getUser)

// Azure
router.route("/azure/uploads").get(getAzureBlobStorage)
router.route("/azure/uploads").post(uploadStrategy, postAzureBlobStorage)

// AWS
router.route("/aws/buckets").get(getAWSS3BucketsList)
router.route("/aws/buckets/:bucketName").get(getCreateAWSS3Bucket)
router.route("/aws/buckets/:bucketName").delete(deleteAWSS3Bucket)

router.route("/aws/buckets/:bucketName/objects").get(getAWSS3BucketObjects)

router.route("/aws/buckets/:bucketName/upload").post(uploadStrategy, uploadAWSS3BucketObject)

router.route("/uploads/:videoPath").get(getVideo)
router.route("/private-video/:email").get(getPrivateVideo)

router.route("/videos").get(getVideos)

router.route("/login").post(login)
router.route("/delDB").get(delDB)

router.route("/projects/submit-project").get(postProject)
router.route("/projects/get-projects/:email").get(getProjects)

// exporting the router module
module.exports = router
