const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { readFileSync, writeFileSync } = require("fs");

const router = express.Router();
const jwtsecret = "mysecretcodefromtodolist";
const users = JSON.parse(readFileSync("./data/users.json"));

router.get("/login", (req, res) => {
  res.render("login.hbs", {
    pageTitle: "Login",
    loggedIn: req.loggedIn,
  });
});

router.post("/loginauth", async (req, res) => {
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
      res.render("login.hbs", {
        pageTitle: "Login",
        loggedIn: req.loggedIn,
        message: "entered password is wrong",
      });
    }
  } else {
    res.render("login.hbs", {
      pageTitle: "Login",
      loggedIn: req.loggedIn,
      message: "user not found",
    });
  }
});

router.get("/signup", (req, res) => {
  res.render("signup.hbs", {
    pageTitle: "Signup",
    loggedIn: req.loggedIn,
  });
});

router.post("/signupauth", async (req, res) => {
  const { username, email, password } = req.body;

  let existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.render("signup.hbs", {
      pageTitle: "Signup",
      loggedIn: req.loggedIn,
      message: "user already exists please login",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const passwordMatched = await bcrypt.compare(password, hash);

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

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { expiresIn: new Date(0) });
  res.redirect("/login");
});

module.exports = router;
