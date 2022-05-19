const { getAllDbUserDAO } = require("../../dao/adminDAO")

exports.getAllDbUser = async (req, res) => {
	try {
		const result = await getAllDbUserDAO()
		console.log(result)
		res.send("Got the admin routes : ")
	} catch(e) {
		console.log("Error Occured to the getAllDbUser fn : ", e)
		res.status(500)
	}
}
