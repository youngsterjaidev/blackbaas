const express = require("express")

const { getAllDbUser } =  require("../../api/admin/admin.controller")

const router = express.Router()

router.route("/").get(getAllDbUser)

module.exports = router

