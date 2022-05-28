const app = require("./server");
const { MongoClient } = require("mongodb");
const { injectDB } = require("./dao/usersDAO");
const { injectAdminDB } = require("./dao/adminDAO");
const port = process.env.PORT || 8000;

(async () => {
	try {
		let client = await MongoClient.connect(
			process.env.MONGODB_URI || "mongodb://localhost:27017"
		);
		await injectDB(client);
		await injectAdminDB(client);
		app.listen(port, () => {
			console.log(`Server is running at ${port}`);
		});
	} catch (e) {
		console.error("Error While connected with mongodb : ", e);
	}
})();
