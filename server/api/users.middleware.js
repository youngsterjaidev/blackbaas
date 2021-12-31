const multer = require("multer");
const { addVideoEntry } = require("../dao/usersDAO");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("okay ", req);
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    console.log(file.originalname, req);
    cb(null, `${file.originalname}`);
  },
});

exports.addEntryInDatabase = async (req, res, next) => {
  try {
    const file = req.file;
    const { email, title, isPrivate } = req.body;
    console.log(req);
    let result = await addVideoEntry(
      email,
      title,
      file.originalname,
      isPrivate
    );
    if (result) {
      next();
			return
    }
    res.status(204).json({ message: "No User Found" });
  } catch (e) {
    console.error(`Error Occured  while entry in the database : ${e}`);
    res.status(500).json({ message: "Something went wrong !" });
  }
};

exports.uploadVideoMiddleware = multer({ storage: storage });
