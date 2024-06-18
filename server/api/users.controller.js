const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const {
	BlobServiceClient,
	StorageSharedKeyCredential,
	newPipeline,
} = require("@azure/storage-blob");

const AWS = require("aws-sdk");

AWS.config.update({ region: "ap-south-1" });

let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const SECRET_KEY = process.env.SECRET_KEY || "fdsfjhsdjfhdjs";

const containerName1 = "azurelearnstorage";
const containerName2 = "images";
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
const ONE_MINUTE = 60 * 1000;

const sharedKeyCredential = new StorageSharedKeyCredential(
	`${process.env.AZURE_STORAGE_ACCOUNT_NAME}`,
	`${process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY}`
);
const pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient = new BlobServiceClient(
	`https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
	pipeline
);

const getBlobName = (originalName) => {
	// use random Number to generate a unique file name,
	// removing "0." from the start of the string
	const identifier = Math.random().toString().replace(/0\./, "");
	return `${identifier}-${originalName}`;
};

const toJSON = ({ username, email }) => {
	return {
		username,
		email,
	};
};

// we don't put this in async because the value is important we can wait until
// its done
const encoded = (userInfo) => {
	return jwt.sign(
		{
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
			...toJSON(userInfo),
		},
		SECRET_KEY
	);
};

const decoded = async (userJWT) => {
	return await jwt.verify(userJWT, SECRET_KEY);
};

const hashPassword = async (password) => await bcrypt.hash(password, 10);

const comparePassword = async (plainText, password) => {
	console.log(plainText, password);
	return await bcrypt.compare(plainText, password);
};

exports.generateRandomEvaluation = () => {
	const generateScore = () => Math.floor(Math.random() * 11);  // 0 to 10
	const generateDecimalScore = () => Number((Math.random() * 10).toFixed(1));  // 0.0 to 10.0
  
	const feedbackOptions = [
	  "Great project! Your implementation shows strong technical skills. Consider adding more comments to improve code readability.",
	  "Impressive work overall. The creativity stands out, but there's room for improvement in problem-solving.",
	  "Solid technical foundation. The documentation could be more comprehensive to help users understand the project better.",
	  "Excellent presentation! The project solves a real problem, but consider optimizing some parts of the code for better performance.",
	  "Good effort! The project shows potential. Focus on enhancing the user interface and adding more features in future iterations.",
	  "Strong problem-solving approach. To take it to the next level, consider implementing more advanced algorithms.",
	  "Well-documented project. To improve, try to make the code more modular and reusable.",
	  "Innovative idea with good execution. Adding unit tests would significantly enhance the project's reliability.",
	  "Technically sound project. Consider gathering user feedback to guide future development priorities.",
	  "Great attention to detail in the presentation. To improve, focus on making the codebase more scalable for future expansions."
	];
  
	return {
	  overallScore: generateDecimalScore(),
	  creativity: generateScore(),
	  technicalProficiency: generateScore(),
	  problemSolving: generateScore(),
	  documentation: generateScore(),
	  presentation: generateScore(),
	  feedback: feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]
	};
  }

exports.extractRepoName = (url) => {
	const parts = url.split('/');
	return parts[parts.length - 1].replace('.git', '');
  };

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
	postProjectDAO,
	getProjectsDAO
} = require("../dao/usersDAO");

const { getAWSS3BucketsListDAO } = require("../dao/awsDAO");

exports.login = async (req, res) => {
	try {
		if (!req.body) return res.status(400).json({ message: "Bad Request !" });

		const { email, password } = req.body;

		// validat the inputs
		if (typeof email !== "string" || !email) {
			res.status(400).json({ message: "Bad Request Email !" });
		}

		if (typeof password !== "string" || !password) {
			res.status(400).json({ message: "Bad Request Password !" });
		}

		console.log("Safe Point");

		// get the user from the database
		const userData = await getUserDAO(email);

		// check if it not returning anything there is no record in the database
		if (!userData) {
			return res.status(204).json({ message: "Not Registered yet !" });
		}

		// then check the password
		if (!(await comparePassword(password, userData.user.password))) {
			return res.status(200).json({ message: "Something went wrong !" });
		}

		// store the user's login info in the database
		const loginResponse = await loginUserDAO(
			userData.user.email,
			encoded(userData.user)
		);

		if (!loginResponse) {
			return res.status(200).json({ message: "Something went wrong !" });
		}

		// send the token and info of user as he login
		res
			.status(200)
			.json({ auth_token: encoded(userData.user), info: userData.user });
	} catch (e) {
		console.error("Error Occured while user Login : ", e);
		//res.status(400).json({ message: "Someting broke !" })
	}
};

exports.getAllUsers = async (req, res) => {
	let result = await getAllUsersDAO();
	console.log(result);
	if (result) {
		res.status(200).json(result);
	}
};

exports.delCol = async (req, res) => {
	try {
		if (!req.body) {
			console.log("Request have no body !");
			res.status(204).json({ message: "Something went wrong !" });
		}

		let { colName } = req.body;

		let feedback = await delColDAO(colName);

		if (feedback) {
			res.status(200).json({
				message: "All users are deleted successfully !",
				data: feedback,
			});
			return;
		}
		res.status(204).json({ message: "Users are not found !" });
	} catch (e) {
		console.error("Error occured in delCol fn ", e);
	}
};

/**
 * @param [email] of the user
 * @param [password] of the user
 * @param [username] name of the user
 */
exports.addUser = async (req, res) => {
	try {
		const { email, password, username } = req.body;

		console.log("====", email, password, username);

		// get the user from the database
		const findUserData = await getUserDAO(email);

		console.log("UserData", findUserData);

		// check if there no user record
		if (findUserData) {
			res.status(404).json({
				message: "User already Registered !",
			});
			return;
		}

		// change the password to encrypted home
		let hash = await hashPassword(password);

		// send the info to the DAO
		let status = await addUserDAO(username, email, hash);

		// get the user from the database
		const userData = await getUserDAO(email);
		console.log(status);

		if (status) {
			// store the user's login info in the database
			const loginResponse = await loginUserDAO(
				userData.user.email,
				encoded(userData.user)
			);

			if (!loginResponse) {
				return res.status(400).json({ message: "Something went wrong !" });
			}

			console.log("Login Response ", loginResponse);

			// send the token and info of user as he login
			res.status(200).json({
				message: "User Registered Successfully !",
				auth_token: encoded(userData.user),
				info: userData.user,
			});
			return;
		}
	} catch (e) {
		console.error(
			"Error Occured while getting registeration of the user : ",
			e
		);
		res.status(500).json({
			message: "Something went wrong !",
		});
	}
};

/**
 * Delete User
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteUser = async (req, res) => {
	try {
		let feedback = await deleteUserDAO(req.body.userId);

		console.info("feedback", feedback);

		if (feedback?.deletedCount === 0) {
			console.info("End the response !");
			res.status(200).json({
				message: "No User found !",
			});
		} else {
			res.status(200).json({
				message: "User Deleted Successfully !",
			});
		}
	} catch (e) {
		console.error("Error Occured while in deleteUser Request : ", e);
		res.sendStatus(500).json({
			message: "Something Went Wrong !",
		});
	}
};

/**
 * @param [key] required in the headers for authentication
 * @param [email] required to find the data
 */
exports.getUser = async (req, res) => {
	const { key } = req.headers;
	const { userId } = req.params;

	if (!userId) {
		res.status(204).json({ message: "No Record Found !" });
	}

	if (key) {
		let result = await getUserDAO(userId, key);
		if (result) {
			res.status(200).json(result);
			return;
		}

		res.status(204).json({ message: "No Record Found !" });
		return;
	}

	let result = await getUserDAO(userId);

	res.status(200).json(result);
};

exports.getVideo = async (req, res) => {
	console.log("Hit That function");

	// get the range from the headers
	const range = req.headers.range;
	//const range = "bytes=0-"
	// const { key } = req.params
	const videoPath = path.join(
		__dirname,
		`../../uploads/${req.params.videoPath}`
	);

	console.log("Key --- ", req.headers.key);

	if (!range) {
		console.log(req.params);
		res.status(403).send("Permission Denied");
	}

	// if (!key) {
	//     res.status(403).send("Access Denied")
	// }

	try {
		const videoSize = fs.statSync(videoPath);
		const CHUNK_SIZE = 10 ** 6;
		// get the start by replacing and get the number
		const start = Number(range.replace(/\D/g, ""));
		const end = Math.min(start + CHUNK_SIZE, videoSize.size - 1);
		const contentLength = end - start + 1;

		const headers = {
			"Content-Range": `bytes ${start}-${end}/${videoSize.size}`,
			"Accept-Ranges": "bytes",
			"Content-Length": contentLength,
			"Content-Type": "video/mp4",
		};

		// send header that is 206 i.e. open connection and send the headers
		res.writeHead(206, headers);

		const videoStream = fs.createReadStream(videoPath, { start, end });

		videoStream.pipe(res);
	} catch (e) {
		console.log(`Error Occured : ${e}`);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

exports.getVideos = async (req, res) => {
	try {
		let result = await getVideosDAO();
		res.status(200).json(result);
	} catch (e) {
		console.error("Error Occured whiles getting all public video : ", e);
	}
};

exports.uploadVideo = async (req, res) => {
	res.status(200).json({
		message: "Uploaded Successfully!",
	});
};

exports.getPrivateVideo = async (req, res) => {
	try {
		let { email } = req.params;
		const result = await this.getPrivateVideoDAO(email);
		return res.status(200).json(result);
	} catch (e) {
		console.error("Error while getting the private video : ", e);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

exports.delDB = async (req, res) => {
	try {
		let feedback = await getDelDB();

		if (feedback) {
			res.status(200).json({ message: "Default Database is deleted !" });
			return;
		}

		res.status(204).json({ message: "Default Database is deleted !" });
	} catch (e) {
		console.error("Error Occured in delDB fun ", e);
		res.status(500).json({
			message: "Something went Wrong !",
		});
	}
};

/*
 *
 */
exports.getAzureBlobStorage = async (req, res, next) => {
	let viewData;

	try {
		// get the container client from the blobServiceClient
		const containerClient =
			blobServiceClient.getContainerClient(containerName1);
		// get the list of blobs from the response
		const listBlobsResponse = await containerClient.listBlobFlatSegment();

		for await (const blob of listBlobsResponse.segment.blobItems) {
			console.log(`Blob: ${blob.name}`);
		}

		viewData = {
			title: "Home",
			viewName: "Index",
			accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
			containerName: containerName1,
		};

		if (listBlobsResponse.segment.blobItems.length) {
			viewData.thumbnails = listBlobsResponse.segment.blobItems;
		}
	} catch (e) {
		viewData = {
			title: "Error",
			viewName: "error",
			message: "There was an error contacting the blob storage container.",
			error: e,
		};
		res.status(500);
	} finally {
		res.json(viewData);
	}
};

exports.postAzureBlobStorage = async (req, res) => {
	try {
		const getStream = await import("into-stream");
		const blobName = getBlobName(req.file.originalname);
		const stream = getStream.default(req.file.buffer);
		const containerClient =
			blobServiceClient.getContainerClient(containerName1);
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);

		await blockBlobClient.uploadStream(
			stream,
			uploadOptions.bufferSize,
			uploadOptions.maxBuffers,
			{ blobHTTPHeaders: { blobContentType: "video/mp4" } }
		);

		res.json({ message: "File Uploaded Successfully" });
	} catch (e) {
		console.log("Error While Uploading the file : ", e);
		res.send("Error While Uploading the file : ", e);
	}
};

// AWS
exports.getAWSS3BucketsList = (req, res) => {
	s3.listBuckets((err, data) => {
		if (err) {
			console.log("Error Occured while getting the buckets list :", e);
			res.status(500).json({ err });
		} else {
			res.status(200).json(data.Buckets);
		}
	});
};

exports.getCreateAWSS3Bucket = (req, res) => {
	let { bucketName } = req.params;
	let bucketsParams = {
		Bucket: bucketName,
	};
	s3.createBucket(bucketsParams, (err, data) => {
		if (err) {
			console.log("Error Occured while getting the buckets list :", err);
			if (err.code === "BucketAlreadyOwnedByYou") {
				res.json({ message: "Bucket already exists !" });
				return;
			}
			res.status(500).json({ err });
		} else {
			res.status(200).json(data);
		}
	});
};

exports.deleteAWSS3Bucket = (req, res) => {
	let { bucketName } = req.params;
	let bucketsParams = {
		Bucket: bucketName,
	};
	s3.deleteBucket(bucketsParams, (err, data) => {
		if (err) {
			console.log("Error Occured while getting the buckets list :", err);
			if (err.code === "BucketAlreadyOwnedByYou") {
				res.json({ message: "Bucket already exists !" });
				return;
			}
			res.status(500).json({ err });
		} else {
			res.status(200).json({
				message: "Bucket deleted Successfully",
			});
		}
	});
};

/*
 * Get all the object in the blob storage
 * - Get the bucket name from the request parmater
 * - create a bucket params along with bucket name
 */
exports.getAWSS3BucketObjects = (req, res) => {
	let { bucketName } = req.params;
	let bucketsParams = {
		Bucket: bucketName,
	};
	s3.listObjects(bucketsParams, (err, data) => {
		if (err) {
			console.log("Error Occured while getting the buckets list :", err);
			if (err.code === "BucketAlreadyOwnedByYou") {
				res.json({ message: "Bucket already exists !" });
				return;
			}
			res.status(500).json({ err });
		} else {
			res.status(200).json(data.Contents);
		}
	});
};

/*
 * Upload the blob file to S3 bucket
 */
exports.uploadAWSS3BucketObject = async (req, res) => {
	try {
		const getStream = await import("into-stream");
		const fileStream = getStream.default(req.file.buffer);
		let uploadParams = {
			Bucket: req.params.bucketName,
			Key: req.file.originalname,
			Body: fileStream,
		};
		s3.upload(uploadParams, (err, data) => {
			if (err) {
				console.log("Error Occured ", err);
				res.send(err);
			} else {
				res.json(data);
			}
		});
	} catch (e) {
		console.log(
			"Error Occured while uploading the image to aws uploadAWSS3BucketObject fn: ",
			e
		);
	}
};

// Projects
exports.postProject = (req, res) => {
	try {
		if(!req.body) {
			console.log("Body not found")
			res.status(204).json({ message: "Something went wrong !" });
			return
		}

		const { email, githubUrl, videoUrl } = req.body

		// validat the inputs
		if (typeof email !== "string" || !email) {
			console.log("Email not found")
			res.status(400).json({ message: "Bad Request Email !" });
			return
		}

		if (typeof githubUrl !== "string" || !githubUrl) {
			console.log("GithubUrl not found")
			res.status(400).json({ message: "Bad Request githubUrl !" });
			return
		}

		if (typeof videoUrl !== "string" || !videoUrl) {
			console.log("videoUrl not found")
			res.status(400).json({ message: "Bad Request videoUrl !" });
			return
		}

		let result = postProjectDAO(email, githubUrl, videoUrl)

		res.json({
			message: "Project submitted Successfully!",
			info: result
		})
	} catch(e) {
		console.log("Error Occured while submiting the project postProject: ", e)
	}
}

exports.getProjects = async (req, res) => {
	try {
		console.log(req.params)
	  const email = req.params.email; // Get email from query parameter
  
	  // If email is not provided or not a string, return an error
	  if (typeof email !== 'string' || !email) {
		console.log('Email not found');
		res.status(400).json({ message: 'Bad Request Email!' });
		return;
	  }
  
	  // Call the getProjectsDAO function to fetch projects from the database
	  const projects = await getProjectsDAO(email);

	  console.log(projects)
  
	  // If no projects found, return an appropriate response
	  if (!projects || projects.length === 0) {
		res.status(404).json({ message: 'No projects found!' });
		return;
	  }
  
	  // Send the projects as a response
	  res.json({ projects });
	} catch (e) {
	  console.log('Error occurred while fetching projects:', e);
	  res.status(500).json({ message: 'Internal Server Error' });
	}
  };
