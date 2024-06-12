const { ObjectId } = require("bson");

let _dbUsers;

exports.injectDB = function (client) {
    try {
        _dbUsers = client.db("server967");
    } catch (e) {
        console.error("Error while inject the mongodb client : ", e);
    }
};

/**
 * Delete the default database
 */
exports.getDelDB = async () => {
	try {
		let feedback = await _dbUsers.dropDatabase()

		console.log(feedback)

		if(!feedback) return null

		return feedback
	} catch(e) {
		console.error("Error Occured in getDelDB fn ", e)
		return null
	}
}

/**
 * @param [username] name of the user 
 * @param [email] email address of the user 
 * @param [password] password of the user 
 */
exports.addUserDAO = async (username, email, password) => {
    console.log("Add User DAO ", email, password, username);
    try {
        let feedback = await _dbUsers.collection("users").insertOne({
            username,
            email,
            password,
            profilePicUrl: null,
            bio: null,
            videos: [],
            time: Date.now(),
        });
        return feedback;
    } catch (e) {
        console.error(
            "Error Occured while adding the data to the database : ",
            e
        );
    }
};

exports.deleteUserDAO = async (userId) => {
    console.log("Delete User DAO")
    try {
        let feedback = await _dbUsers.collection("users").deleteOne({
            "_id": ObjectId(userId)
        })

        if (feedback) {
            return feedback
        }

        return null
    } catch (e) {
        console.error("Error Occured while deleting user from the database :", e)
        return null
    }
}

exports.getAllUsersDAO = async () => {
    try {
        let feedback = await _dbUsers.collection("users").find({}).toArray();
        return feedback;
    } catch (e) {
        console.log("Error Occured while getting all teh user Info : ", e);
    }
};

const findUser = async (email) => {
    console.log("get the Email ", email);
    let feedback = await _dbUsers.collection("users").findOne({ email: email });
    return feedback;
};

exports.delColDAO = async (colName) => {
	console.log("colName", colName)
	try {
		let feedback = await _dbUsers.collection(colName).drop()

		if(!feedback) return null

		return feedback
	} catch(e) {
		console.error("Error Occured in delColDAO fn ", e)
		return null
	}
}

/**
 * @param [email] write in the document
 * @param [title] name given to the video filePath
 * @param [filePath] the name of the file to find that
 * @param [isPrivate] is it publicaly available or not
 */
exports.addVideoEntry = async (email, title, filePath, isPrivate) => {
    console.log(email, title, filePath, isPrivate);
    try {
        let user = await findUser(email);

        // if the user not null
        if (user) {
            let video = await _dbUsers.collection("videos").insertOne({
                uploadBy: user._id,
                title,
                filePath,
                isPrivate: isPrivate === "true",
            });
            if (video) {
                let feedback = await _dbUsers.collection("users").updateOne(
                    {
                        email: user.email,
                    },
                    {
                        $push: {
                            videos: {
                                videoId: video.insertedId,
                                filePath,
                            },
                        },
                    }
                );
								console.log("addVideoEntry feedback", feedback)
                return feedback;
            }
        }

        return null;
    } catch (e) {
        console.error("Error Occured while video information : ", e);
    }
};

exports.getUserDAO = async (userId, key) => {
    try {
        console.log("Destination reached")
        let feedback = await _dbUsers.collection("users").findOne({
            "email": userId
        })

        console.log("Reached getUser")

        if (!feedback) {
            return null
        }

        if (key) {
            let result = await _dbUsers.collection("videos").find({
                uploadBy: feedback._id,
                isPrivate: true
            }).toArray()
            return { user: feedback, videos: result }
        } else {
            let result = await _dbUsers.collection("videos").find({
                uploadBy: feedback._id,
                isPrivate: false
            }).toArray()
            return { user: feedback, videos: result }
        }
    } catch (e) {
        console.error("Error Occured in getUserDAO : ", e)
    }
}

exports.getVideosDAO = async () => {
    try {
        let result = await _dbUsers.collection("videos").find({
            isPrivate: false
        }).toArray()
        return result
    } catch (e) {
        console.error("Error Occured gettting videos from the database : ", e)
        return null
    }
}

exports.loginUserDAO = async (email, token) => {
    try {
        // check the email and token should be present
        if (!email && !token) return null

        // update the login details
        let result = await _dbUsers.collection("login").updateOne(
            {
                email: email
            },
            {
                $set: {
                    token: token,
                    time: Date.now()
                }
            },
            { upsert: true })

        return result
    } catch (e) {
        console.error("Error Occured while setting the login info in the database : ", e)
        return null
    }
}

exports.getPrivateVideoDAO = async (email) => {
    try {
        let result = await _dbUsers.collection("users").findOne({
            email: email
        })
        let feedback = await _dbUsers.collection("videos").find({
            isPrivate: true,
            uploadBy: result._id
        }).toArray
        return feedback
    } catch (e) {
        console.error("Error Occured while getting the private video : ", e)
        return null
    }
}

exports.postProjectDAO = async (email, githubUrl, videoUrl) => {
    try {
        let feedback = await _dbUsers.collection("users").updateOne(
            {
                email: email,
            }, 
            {
                $push: {
                    projects: { 
                        githubUrl,
                        videoUrl,
                        time: Date.now()
                    }
                }
            },
            { upsert: true }
        )

        if(!feedback) {}

        return feedback
    } catch(e) {
        console.log("Error Occured while adding the project data to the users info postProject fn : ", e)
    }
}

exports.getProjectsDAO = async (email) => {
    try {
        let projection = {
            _id: 0,
            email: 1,
            projects: 1
        }

        console.log(projection, email)

        let feedback = await _dbUsers.collection("users").find(
            {email},
            {projection}
        ).toArray()

        console.log(feedback)

        if(!feedback) {}

        return feedback
    } catch(e) {
        console.log("Error Occured while finding the project from the database getProjectsDAO fn : ", e)
    }
}
