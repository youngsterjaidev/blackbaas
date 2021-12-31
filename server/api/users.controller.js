const fs = require("fs")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require("path")

const SECRET_KEY = process.env.SECRET_KEY || "fdsfjhsdjfhdjs"

const toJSON = ({ username, email }) => {
    return {
        username,
        email
    }
}

// we don't put this in async because the value is important we can wait until
// its done
const encoded = (userInfo) => {
    return jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
            ...toJSON(userInfo)
        },
        SECRET_KEY
    )
}

const decoded = async (userJWT) => {
    return await jwt.verify(userJWT, SECRET_KEY)
}

const hashPassword = async password => await bcrypt.hash(password, 10)

const comparePassword = async (plainText, password) => {
    console.log(plainText, password)
    return await bcrypt.compare(plainText, password)
}

const {
    addUserDAO,
    getAllUsersDAO,
		delColDAO,
    getUserDAO,
    getVideosDAO,
    loginUserDAO,
    getPrivateVideoDAO,
    deleteUserDAO,
		getDelDB,
} = require("../dao/usersDAO")

exports.login = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ message: "Bad Request !" })

        const { email, password } = req.body

        // validat the inputs 
        if (typeof email !== "string" || !email) {
            res.status(400).json({ message: "Bad Request Email !" })
        }

        if (typeof password !== "string" || !password) {
            res.status(400).json({ message: "Bad Request Password !" })
        }

        console.log("Safe Point")

        // get the user from the database
        const userData = await getUserDAO(email)

        // check if it not returning anything there is no record in the database
        if (!userData) {
            return res.status(204).json({ message: "Not Registered yet !" })
        }

        // then check the password
        if (!(await comparePassword(password, userData.user.password))) {
            return res.status(200).json({ message: "Something went wrong !" })
        }

        // store the user's login info in the database
        const loginResponse = await loginUserDAO(userData.user.email, encoded(userData.user))

        if (!loginResponse) {
            return res.status(200).json({ message: "Something went wrong !" })
        }

        // send the token and info of user as he login 
        res.status(200).json({ auth_token: encoded(userData.user), info: userData.user })
    } catch (e) {
        console.error("Error Occured while user Login : ", e)
        //res.status(400).json({ message: "Someting broke !" })
    }
}

exports.getAllUsers = async (req, res) => {
    let result = await getAllUsersDAO()
    console.log(result)
    if (result) {
        res.status(200).json(result)
    }
}

exports.delCol = async (req, res) => {
	try {
		if(!req.body) {
			console.log("Request have no body !")
			res.status(204).json({ message: "Something went wrong !" })
		}

		let { colName } = req.body

		let feedback = await delColDAO(colName)

		if(feedback) {
			res.status(200).json({ 
				message: "All users are deleted successfully !",
				data: feedback
			})
			return
		}
		res.status(204).json({ message: "Users are not found !" })
	} catch(e) {
		console.error("Error occured in delCol fn ", e)
	}
}

/**
 * @param [email] of the user
 * @param [password] of the user
 * @param [username] name of the user 
 */
exports.addUser = async (req, res) => {
    try {
        const { email, password, username } = req.body

        console.log("====", email, password, username)

        // get the user from the database
        const findUserData = await getUserDAO(email)

        console.log("UserData", findUserData)

        // check if there no user record
        if (findUserData) {
            res.status(404).json({
                message: "User already Registered !"
            })
            return
        }

        // change the password to encrypted home
        let hash = await hashPassword(password)

        // send the info to the DAO
        let status = await addUserDAO(username, email, hash)

        // get the user from the database
        const userData = await getUserDAO(email)
        console.log(status)

        if (status) {
            // store the user's login info in the database
            const loginResponse = await loginUserDAO(userData.user.email, encoded(userData.user))

            if (!loginResponse) {
                return res.status(400).json({ message: "Something went wrong !" })
            }

            console.log("Login Response ", loginResponse)

            // send the token and info of user as he login 
            res.status(200).json({
                message: "User Registered Successfully !",
                auth_token: encoded(userData.user), info: userData.user
            })
            return
        }
    } catch (e) {
        console.error("Error Occured while getting registeration of the user : ", e)
        res.status(500).json({
            message: "Something went wrong !"
        })
    }
}

/**
 * Delete User
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.deleteUser = async (req, res) => {
    try {
        let feedback = await deleteUserDAO(req.body.userId)

        console.info("feedback", feedback)

        if (feedback?.deletedCount === 0) {
            console.info("End the response !")
            res.status(200).json({
                message: "No User found !"
            })
        } else {
            res.status(200).json({
                message: "User Deleted Successfully !"
            })
        }
    } catch (e) {
        console.error("Error Occured while in deleteUser Request : ", e)
        res.sendStatus(500).json({
            message: "Something Went Wrong !"
        })
    }
}

/**
 * @param [key] required in the headers for authentication
 * @param [email] required to find the data 
 */
exports.getUser = async (req, res) => {
    const { key } = req.headers
    const { userId } = req.params

    if (!userId) {
        res.status(204).json({ message: "No Record Found !" })
    }

    if (key) {
        let result = await getUserDAO(userId, key)
        if (result) {
            res.status(200).json(result)
						return
        }

        res.status(204).json({ message: "No Record Found !" })
				return 
    }

    let result = await getUserDAO(userId)

    res.status(200).json(result)
}

exports.getVideo = async (req, res) => {
    console.log("Hit That function")

    // get the range from the headers
    const range = req.headers.range
    //const range = "bytes=0-"
    // const { key } = req.params
    const videoPath = path.join(__dirname, `../../uploads/${req.params.videoPath}`)

    console.log("Key --- ", req.headers.key)

    if (!range) {
        console.log(req.params)
        res.status(403).send("Permission Denied")
    }

    // if (!key) {
    //     res.status(403).send("Access Denied")
    // }

    try {
        const videoSize = fs.statSync(videoPath)
        const CHUNK_SIZE = 10 ** 6
        // get the start by replacing and get the number
        const start = Number(range.replace(/\D/g, ""))
        const end = Math.min(start + CHUNK_SIZE, videoSize.size - 1)
        const contentLength = end - start + 1

        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize.size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4"
        }

        // send header that is 206 i.e. open connection and send the headers
        res.writeHead(206, headers)

        const videoStream = fs.createReadStream(videoPath, { start, end })

        videoStream.pipe(res)
    } catch (e) {
        console.log(`Error Occured : ${e}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.getVideos = async (req, res) => {
    try {
        let result = await getVideosDAO()
        res.status(200).json(result)
    } catch (e) {
        console.error("Error Occured whiles getting all public video : ", e)
    }
}

exports.uploadVideo = async (req, res) => {
    res.status(200).json({
        message: "Uploaded Successfully!"
    })
}

exports.getPrivateVideo = async (req, res) => {
    try {
        let { email } = req.params
        const result = await this.getPrivateVideoDAO(email)
        return res.status(200).json(result)
    } catch (e) {
        console.error("Error while getting the private video : ", e)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.delDB = async(req, res) => {
	try {
		let feedback = await getDelDB()

		if(feedback) {
			res.status(200).json({ message: "Default Database is deleted !" })
			return
		}

		res.status(204).json({ message: "Default Database is deleted !" })
	} catch(e) {
		console.error("Error Occured in delDB fun ", e)
		res.status(500).json({
			message: "Something went Wrong !"
		})
	}
}
