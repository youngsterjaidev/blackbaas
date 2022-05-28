const AWS = require("aws-sdk")

AWS.config.update({ region: "ap-south-1"})

let s3 = new AWS.S3({ apiVersion: "2006-03-01" })

exports.getAWSS3BucketsListDAO = async () => {
	try {
		s3.listBuckets((e, data) => {
			if(e) {
				console.log("Erro ----", e)
				return null
			} else {
				return data
			}
		})
	} catch(e) {
		console.log("Error Occured while getting the bucket list from aws getAWSS3BucketsListDAO fn : ", e)
	}
}
