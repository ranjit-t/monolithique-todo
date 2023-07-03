const jwt = require("jsonwebtoken");

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

exports.middleWare1 = middleWare1;
exports.middleWare2 = middleWare2;
