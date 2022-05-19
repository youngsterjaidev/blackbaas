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
  postAzureBlobStorage
} = require("./users.controller")

const router = express.Router()




// ROUTES
router.route("/").get(getAllUsers)

router.route("/delCol").delete(delCol)

router.route("/add").post(addUser)
router.route("/delete").delete(deleteUser)

router.route("/uploads").post(uploadVideoMiddleware.single("video"), addEntryInDatabase, uploadVideo)
router.route("/userId/:userId").get(getUser)

router.route("/azure/uploads").get(getAzureBlobStorage)
//router.route("/azure/uploads").post(uploadStrategy, postAzureBlobStorage)

router.route("/uploads/:videoPath").get(getVideo)
router.route("/private-video/:email").get(getPrivateVideo)

router.route("/videos").get(getVideos)

router.route("/login").post(login)
router.route("/delDB").get(delDB)

/*

let contries = [
  { name: "Afghanistan", captial: "Kabul", area: "652,864" },
  { name: "Armenia", capital: "Yerevan", area: "29,743" },
  { name: "Azerbaijan", capital: "Baku", area: "86,600" },
  { name: "Bahrain", capital: "Manama", area: "760" },
  { name: "Bangladesh", capital: "Dhaka", area: "147,570" },
  { name: "Bhutan", capital: "Thimphu", area: "38,394" },
  { name: "Brunei", capital: "Bandar Seri Begawan", area: "5,765" },
  { name: "Cambodia", capital: "Phnom Penh", area: "181,035" },
  { name: "China (PRC)", capital: "Beijing", area: "9,596,961" },
  { name: "East Timor", capital: "Dili", area: "14,874" },
  { name: "Georgia", capital: "Tbilisi", area: "69,700" },
  { name: "Hong Kong", capital: "City of Victoria", area: "2,755" },
  { name: "India	New Delhi	3,287,263	1,393,409,038" },
  { name: "Indonesia	Jakarta	1,904,569	276,361,783" },
  { name: "Iran	Tehran	1,648,195	85,028,759" },
  { name: "Iraq	Baghdad	438,317	41,179,350" },
  { name: "Israel	Jerusalem (disputed)	20,770	8,789,774" },
  { name: "Japan	Tokyo	377,915	126,050,804" },
  { name: "Jordan	Amman	89,342	10,269,021" },
  { name: "Kazakhstan	Nur-Sultan	2,724,900	18,994,962" },
  { name: "Kuwait	Kuwait City	17,818	4,328,550" },
  { name: "Kyrgyzstan	Bishkek	199,951	6,628,356" },
  { name: "Laos	Vientiane	236,800	7,379,358" },
  { name: "Lebanon	Beirut	10,400	6,769,146" },
  { name: "Macau	Macau	115	658,394" },
  { name: "Malaysia	Kuala Lumpur	329,847	32,776,194" },
  { name: "Maldives	Malé	298	543,617" },
  { name: "Mongolia	Ulaanbaatar	1,564,116	3,329,289" },
  { name: "Myanmar	Naypyidaw	676,578	54,806,012" },
  { name: "Nepal	Kathmandu	147,181	29,674,920" },
  { name: "North Korea	Pyongyang	120,538	25,887,041" },
  { name: "Oman	Muscat	309,500	5,223,375" },
  { name: "Pakistan	Islamabad	881,913	225,199,937" },
  { name: "Palestine	Ramallah	6,220	5,222,748" },
  { name: "Qatar	Doha	11,586	2,930,528" },
  { name: "Russia	Moscow	17,098,242	145,734,038" },
  { name: "Saudi Arabia	Riyadh	2,149,690	35,340,683" },
  { name: "Singapore	Singapore	697	5,896,686" },
  { name: "South Korea	Seoul	100,210	51,305,186" },
  { name: "Sri Lanka	Sri Jayawardenepura Kotte	65,610	21,497" }
{ name: "Syria	Damascus	185,180	18,275,702" },
  { name: "Taiwan	Taipei	36,193	23,855,010" },
  { name: "Tajikistan	Dushanbe	143,100	9,749,627" },
  { name: "Thailand	Bangkok	513,120	69,950,850" },
  { name: "The Philippines	Manila	343,448	111,046,913" },
  { name: "Turkey	Ankara	783,562	85,042,738" },
  { name: "Turkmenistan	Ashgabat	488,100	6,117,924" },
  { name: "United Arab Emirates	Abu Dhabi	83,600	9,991,0" }, 89
{ name: "Uzbekistan	Tashkent	447,400	33,935,763" },
  { name: "Vietnam	Hanoi	331,212	98,168,833" },
  { name: "Yemen	Sana'a	527,968	30,490,640" },
]
	*/


// exporting the router module
module.exports = router
