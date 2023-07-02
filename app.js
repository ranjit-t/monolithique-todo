const express = require("express");
const dotenv = require("dotenv");
const hbs = require("hbs");
const path = require("path");
const { readFileSync, writeFileSync } = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const hbsViewsPath = path.join(__dirname, "./templates/views");
const hbsPartialsPath = path.join(__dirname, "./templates/partials");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

app.use(express.static("public"));

app.set("view engine", "hbs");
hbs.registerPartials(hbsPartialsPath);
app.set("views", hbsViewsPath);

const users = JSON.parse(readFileSync("./data/users.json"));

const jwtsecret = "mysecretcodefromtodolist";

// MiddleWare for Login and Signup
const middleWare1 = (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, jwtsecret);
      var currentTimestamp = new Date().getTime() / 1000;
      req.loggedIn = decodedToken.exp > currentTimestamp;
      req.email = decodedToken.email;
    } catch (err) {
      req.loggedIn = false;
      console.log(err);
    }
  }
  next();
};

// MiddleWare for the rest

const middleWare2 = (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token) {
    return res.redirect("/login");
  }
  if (token) {
    try {
      const decodedToken = jwt.verify(token, jwtsecret);
      var currentTimestamp = new Date().getTime() / 1000;
      req.loggedIn = decodedToken.exp > currentTimestamp;
      req.email = decodedToken.email;
    } catch (err) {
      req.loggedIn = false;
      console.log(err);
      return res.redirect("/login");
    }
  }
  //   console.log(req.loggedIn);
  next();
};

app.use(middleWare1);

app.get("/", async (req, res) => {
  const email = req.email;
  if (!email) {
    return res.render("index.hbs", {
      pageTitle: "Todo List",
      loggedIn: req.loggedIn,
    });
  }
  let existingUser = users.find((user) => user.email === email);
  const tasks = existingUser.tasks;

  res.render("index.hbs", {
    pageTitle: "Todo List",
    loggedIn: req.loggedIn,
    tasks: tasks,
  });
});

app.get("/login", (req, res) => {
  res.render("login.hbs", {
    pageTitle: "Login",
    loggedIn: req.loggedIn,
    // tasks,
  });
});

app.post("/loginauth", async (req, res) => {
  const { email, password } = req.body;
  let existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    const passwordMatched = await bcrypt.compare(password, existingUser.hash);
    console.log(passwordMatched);
    if (passwordMatched) {
      const token = jwt.sign({ email }, jwtsecret, {
        expiresIn: "1d",
      });

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.redirect("/");
    } else {
      return res.send("password didn't match");
    }
  } else {
    return res.send("user not found");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup.hbs", {
    pageTitle: "Signup",
    loggedIn: req.loggedIn,
  });
});

app.post("/signupauth", async (req, res) => {
  const { username, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const passwordMatched = await bcrypt.compare(password, hash);
  console.log(passwordMatched);

  const user = { username, email, hash, tasks: [] };
  users.push(user);
  writeFileSync("./data/users.json", JSON.stringify(users));

  const token = jwt.sign({ email }, jwtsecret, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  res.cookie("jwt", "", { expiresIn: new Date(0) });
  res.redirect("/login");
});

app.use(middleWare2);

app.get("/profile", (req, res) => {
  const email = req.email;

  let existingUser = users.find((user) => user.email === email);
  //   console.log(existingUser);

  res.render("profile.hbs", {
    pageTitle: "Profile",
    loggedIn: req.loggedIn,
    // tasks,
    userdetails: { email, username: existingUser.username },
  });
});

const multer = require("multer");

const avatar = multer({
  // dest: "avatars",

  storage: multer.diskStorage({
    destination: "./public/img",
    filename: function (req, file, cb) {
      const email = req.email; // Assuming req.email contains the email value
      const uniqueFileName = email + ".jpg"; // Use the email as the filename
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

app.post(
  "/avatarupload",
  avatar.single("avatar"),
  (req, res) => {
    // res.send({ message: "image uploaded successfully" });
    console.log("image uploaded successfully");
    res.redirect("/profile");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

app.post("/addtask", (req, res) => {
  const email = req.email;
  let existingUser = users.find((user) => user.email === email);
  const task = req.body.task;
  existingUser.tasks.push(task);
  modifiedUser = { ...existingUser, tasks: existingUser.tasks };
  const restOfTheUsers = users.filter((user) => user.email !== email);
  const allUsers = [...restOfTheUsers, modifiedUser];
  console.log(allUsers);
  writeFileSync("./data/users.json", JSON.stringify(allUsers));
  res.redirect("/");
});
app.post("/deletetask", (req, res) => {
  //   const task = req.body.task;
  //   console.log(task);
  //   const newTasks = tasks.filter((item) => item !== task);
  //   writeFileSync("./data/data.json", JSON.stringify(newTasks));
  // res.send({ link: "/" });

  const email = req.email;
  let existingUser = users.find((user) => user.email === email);
  const task = req.body.task;
  //  existingUser.tasks.push(task);
  const newTasks = existingUser.tasks.filter((item) => item !== task);
  modifiedUser = { ...existingUser, tasks: newTasks };
  const restOfTheUsers = users.filter((user) => user.email !== email);
  const allUsers = [...restOfTheUsers, modifiedUser];
  console.log(allUsers);
  writeFileSync("./data/users.json", JSON.stringify(allUsers));
  res.redirect("/");
});

app.get("*", (req, res) => {
  res.render("404.hbs", {
    pageTitle: "404 : Page not found",
    loggedIn: req.loggedIn,
  });
});

const Port = process.env.PORT || 3000;

app.listen(Port, () => {
  console.log(`Server running on ${Port}`);
});
