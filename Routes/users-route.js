const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersDB = require("../Models/users");

const router = express.Router();
const jwtsecret = "mysecretcodefromtodolist";

router.get("/login", (req, res) => {
  res.render("login.hbs", {
    pageTitle: "Login",
    loggedIn: req.loggedIn,
  });
});

router.post("/loginauth", async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await usersDB.findOne({ email });

  if (existingUser) {
    const passwordMatched = await bcrypt.compare(
      password,
      existingUser.password
    );
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

  const hash = await bcrypt.hash(password, 10);

  const user = new usersDB({ username, email, password: hash });

  await user
    .save()
    .then(() => {
      const token = jwt.sign({ email }, jwtsecret, {
        expiresIn: "1d",
      });

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.redirect("/");
    })
    .catch((err) => {
      console.log(err.code === 11000);
      if (err.code === 11000) {
        return res.render("signup.hbs", {
          pageTitle: "Signup",
          loggedIn: req.loggedIn,
          message: "user already exists please login",
        });
      } else {
        return res.render("signup.hbs", {
          pageTitle: "Signup",
          loggedIn: req.loggedIn,
          message: "Oops,Internal Error",
        });
      }
    });
});

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { expiresIn: new Date(0) });
  res.redirect("/login");
});

module.exports = router;
