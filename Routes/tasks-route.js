const express = require("express");
const { readFileSync, writeFileSync } = require("fs");

const router = express.Router();

router.get("/profile", (req, res) => {
  const users = JSON.parse(readFileSync("./data/users.json"));

  const email = req.email;

  let existingUser = users.find((user) => user.email === email);

  res.render("profile.hbs", {
    pageTitle: "Profile",
    loggedIn: req.loggedIn,
    userdetails: { email, username: existingUser.username },
  });
});

const multer = require("multer");

const avatar = multer({
  // dest: "avatars",

  storage: multer.diskStorage({
    destination: "./public/img",
    filename: function (req, file, cb) {
      const email = req.email;
      cb(null, uniqueFileName);
    },
  }),
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

router.post(
  "/avatarupload",
  avatar.single("avatar"),
  (req, res) => {
    console.log("image uploaded successfully");
    res.redirect("/profile");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post("/addtask", (req, res) => {
  const users = JSON.parse(readFileSync("./data/users.json"));

  const email = req.email;
  let existingUser = users.find((user) => user.email === email);
  const task = req.body.task;
  existingUser.tasks.push(task);
  modifiedUser = { ...existingUser, tasks: existingUser.tasks };
  const restOfTheUsers = users.filter((user) => user.email !== email);
  const allUsers = [...restOfTheUsers, modifiedUser];
  //   console.log(allUsers);
  writeFileSync("./data/users.json", JSON.stringify(allUsers));
  res.redirect("/");
});

router.post("/deletetask", async (req, res) => {
  const users = JSON.parse(readFileSync("./data/users.json"));
  const email = req.email;
  let existingUser = users.find((user) => user.email === email);
  const task = req.body.task;
  const newTasks = existingUser.tasks.filter((item) => item !== task);
  modifiedUser = { ...existingUser, tasks: newTasks };
  const restOfTheUsers = users.filter((user) => user.email !== email);
  const allUsers = [...restOfTheUsers, modifiedUser];
  writeFileSync("./data/users.json", JSON.stringify(allUsers));
  res.redirect("/");
  //   res.send("ok");
});

module.exports = router;
