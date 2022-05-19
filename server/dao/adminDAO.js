let _dbUsers;
/**
 * Inject the mongodb client for interacting the database
 */
exports.injectAdminDB = function (client) {
    try {
        //_dbUsers = client.admin()
    } catch (e) {
        console.error("Error while inject the mongodb client : ", e);
    }
}

/*
 * {param} nothing
 */
exports.getAllDbUserDAO = async () => {
	try {
		//let feedback = await _dbUsers.getUsers()	
		console.log("Feedback  ",_dbUsers)
	} catch(e) {
		console.log("Error", e)
	}
}
