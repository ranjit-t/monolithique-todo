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

// console.log(hbsViewsPath);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

app.use(express.static("public"));

app.set("view engine", "hbs");
hbs.registerPartials(hbsPartialsPath);
app.set("views", hbsViewsPath);

const tasks = JSON.parse(readFileSync("./data/data.json"));
const users = JSON.parse(readFileSync("./data/users.json"));

const jwtsecret = "mysecretcodefromtodolist";

// MiddleWare

// MiddleWare
const middleWare1 = (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, jwtsecret);
      var currentTimestamp = new Date().getTime() / 1000;
      req.loggedIn = decodedToken.exp > currentTimestamp;
    } catch (err) {
      req.loggedIn = false;
      console.log(err);
    }
  }
  //   console.log(req.loggedIn);
  next();
};

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
    tasks,
  });
});

app.post("/loginauth", async (req, res) => {
  const { email, password } = req.body;
  let existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    const passwordMatched = await bcrypt.compare(password, existingUser.hash);
    console.log(passwordMatched);
    if (passwordMatched) {
      // Generate and sign a JSON Web Token (JWT)

      const token = jwt.sign({ email }, jwtsecret, {
        expiresIn: "1d",
      });

      // Set the token as a cookie in the response
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      //   return res.send("login successful");
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
    tasks,
  });
});

app.post("/signupauth", async (req, res) => {
  const { username, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const passwordMatched = await bcrypt.compare(password, hash);
  console.log(passwordMatched);

  const user = { username, email, hash };
  users.push(user);
  writeFileSync("./data/users.json", JSON.stringify(users));

  const token = jwt.sign({ email }, jwtsecret, {
    expiresIn: "1d",
  });

  // Set the token as a cookie in the response
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.redirect("/");
});

app.use(middleWare2);

app.post("/addtask", (req, res) => {
  const task = req.body.task;
  //   console.log(task);
  tasks.push(task);
  writeFileSync("./data/data.json", JSON.stringify(tasks));
  res.redirect("/");
});
app.post("/deletetask", (req, res) => {
  const task = req.body.task;
  console.log(task);
  const newTasks = tasks.filter((item) => item !== task);
  writeFileSync("./data/data.json", JSON.stringify(newTasks));
  res.send({ link: "/" });
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
