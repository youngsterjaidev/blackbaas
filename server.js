// SERVER
require("dotenv").config()
const app = require("express")()
const port = process.env.PORT || 8000
const { MongoClient } = require("mongodb")
const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

(async () => {
	try {
		let client = await MongoClient.connect(URI)

		console.log("Database connected Successfully !")
		
		app.get("/", async (req, res) => {
			console.log("GET /")
			try {
				let db = await client.db("server967")
				let feedback = await db.collection("users").findOne({})
				if(feedback) {
					// get the feedback
					// find the database of the user
					// attach the database associated with it
					console.log(feedback.username)
					let userDB = client.db(feedback.username).collection("users")
					let response = await userDB.findOne({})
					console.log(response)
					res.status(200).json(feedback)
				}

				res.status(204).json({ message: "No record found !" })
			} catch(e) {
				console.error("Error On / route : ", e)
				//res.status(500).json({ message: "Something went wrong !"  })
			}
		})
	} catch(e) {
		// Error handling
		console.error("Error Occured while establishing the connection to database :", e)
	} finally {
		// send the response to the final
		console.log("FN: ->")
	}
})()

app.listen(port, () => {
	console.info(`Server is running at ${port}`)
})
