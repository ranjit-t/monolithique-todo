const express = require("express");
const usersDB = require("../Models/users");

const router = express.Router();

router.get("/profile", async (req, res) => {
  const email = req.email;

  const existingUser = await usersDB.findOne({ email });

  console.log(existingUser.email);

  res.render("profile.hbs", {
    pageTitle: "Profile",
    loggedIn: req.loggedIn,
    userdetails: {
      email,
      username: existingUser.username,
      photo: existingUser.photo.toString("base64"),
    },
  });
});

const multer = require("multer");

const avatar = multer({
  // dest: "avatars",

  // storage: multer.diskStorage({
  //   destination: "./public/img",
  //   filename: function (req, file, cb) {
  //     const email = req.email;
  //     cb(null, uniqueFileName);
  //   },
  // }),
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
      return cb(new Error("please upload image files ending with .jpg"));
    }
    cb(undefined, true);
  },
});

router.post("/avatarupload", avatar.single("avatar"), async (req, res) => {
  try {
    const email = req.email; // Assuming you have the user's email in the request
    const user = await usersDB.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    const fileBuffer = req.file.buffer; // Access the uploaded file's buffer

    // Update the user's photo field with the file buffer
    user.photo = fileBuffer;

    await user.save();

    console.log("Image uploaded successfully");
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

router.post("/addtask", async (req, res) => {
  const email = req.email;
  const task = req.body.task;

  try {
    const updatedUser = await usersDB.findOneAndUpdate(
      { email },
      { $push: { tasks: { title: task } } },
      { new: true }
    );
    if (updatedUser) {
      return res.redirect("/");
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error in adding:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/deletetask", async (req, res) => {
  const email = req.email;
  const task = req.body.task;

  try {
    const updatedUser = await usersDB.findOneAndUpdate(
      { email },
      { $pull: { tasks: { title: task } } },
      { new: true }
    );
    if (updatedUser) {
      return res.redirect("/");
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error in adding:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
